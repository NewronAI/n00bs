import NextExpress from "@/helpers/node/NextExpress";
import assertUp from "@/helpers/node/assert/assertUp";
import { db } from "@/helpers/node/db";
import { check_type, events, request_method } from "@prisma/client";
import { sendTextMessage, sendQuestion, sendInteractiveMessage } from "src/messageHelper";
import { task_status } from "@prisma/client";
import axios from "axios";
import { update, values } from "lodash";

const webhook = new NextExpress();
const webhookSecret = "2d464c63-249b-4c91-8698-45abda5d3b7b"

async function handleHiResponse(waID: any, assigneDetails: any) {
    await sendTextMessage(waID, `Welcome ${assigneDetails.name}!`);

    const workflows = await db.workflow.findMany({
        include: {
            tasks: true
        },
        orderBy: {
            id: "asc"
        }
    });

    const dataFetchPromises = workflows.map(async (flow) => {
        return db.task_assignment.count({
            where: {
                task_id: flow.tasks[0].id,
                assignee_id: assigneDetails.id,
                status: "pending"
            }
        })
    });

    const countValues = await Promise.all(dataFetchPromises);

    const toSendMessage = `You have following number of tasks:\n\n${workflows.map(({ name }, index) => {
        return `${name}  : ${countValues[index]}`
    }).join("\n")}`;

    const buttons = workflows.map((flow) => {
        return {
            type: "reply",
            reply: {
                title: flow.id === 1 ? "Single Audio Check" : "District Audio Check",
                id: JSON.stringify({ type: "wf", wfID: flow.id }),
            }
        }
    });

    await sendInteractiveMessage(waID, {
        body: {
            text: toSendMessage
        },
        type: "button",
        action: {
            buttons: buttons
        }
    });
}

async function getTaskAssingment(workflowID: number, assigneeID: any) {
    const task_assignment = await db.task_assignment.findFirst({
        where: {
            assignee_id: assigneeID,
            status: "pending",
            task: {
                workflow_id: workflowID,
            }
        },
        select: {
            id: true,
            workflow_file: {
                select: {
                    uuid: true,
                    file_name: true,
                    file: true,
                }
            }
        }
    })

    return task_assignment;
}

async function getQuestions(wfID: number, task_assignmentID: any) {
    const taskQuestions = await db.task_assignment.findFirst({
        where: {
            id: task_assignmentID
        },
        select: {
            task: {
                select: {
                    task_questions: {
                        select: {
                            questions: {
                                select: {
                                    id: true,
                                    name: true,
                                    uuid: true,
                                    expected_answer: true,
                                    text: true,
                                    question_type: true,
                                    options: true,
                                }
                            }
                        }
                    }
                }
            }
        }
    })

    const questions = taskQuestions?.task.task_questions.map(question => {
        return question.questions
    })

    return questions;
}

async function handleWFResponse(messageId: any, session: any, waID: number) {

    const task_assignment = await getTaskAssingment(messageId.wfID, session.member_id)
    const questions = await getQuestions(messageId.wfID, task_assignment?.id);
    if (!questions) {
        assertUp(questions, {
            message: "Could Not fetch the questions",
            status: 400
        })
        return;
    }
    let responseJSON: { [key: string]: string } = {};
    questions.map(question => {
        responseJSON[question.uuid] = "null";
    });
    await db.user_session.update({
        where: {
            id: session.id,
        },
        data: {
            task_assignment_id: task_assignment?.id,
            responses: responseJSON,
            current_question_uuid: questions[0].uuid,
        }
    });

    await sendTextMessage(waID, `File Name - ${task_assignment?.workflow_file.file_name.split("/").pop()}\n\n Please visit the below link to view the file\n\n${task_assignment?.workflow_file.file}`)
    await sendQuestion(waID, questions[0].text, questions[0].options, questions[0].uuid, questions[0].expected_answer, messageId.wfID);
}

async function updateSession(responses: any, sessionID: any, current_question_uuid: string) {
    await db.user_session.update({
        where: {
            id: sessionID,
        },
        data: {
            responses,
            current_question_uuid
        }
    })
}

async function handleQuestionResponses(messageId: any, session: any, waID: number, textBody: any) {
    if (messageId.expectedAns === textBody || messageId.wfID === 2) {
        const task_assignment_id = session.task_assignment_id
        const response = session.responses;
        response[messageId.questionUUID] = textBody;
        const questions = await getQuestions(messageId.wfID, task_assignment_id)
        const filteredQuestions = questions?.filter(question => {
            if (question.uuid !== messageId.questionUUID) {
                return question;
            }
        })
        if (!filteredQuestions) {
            return
        }

        await updateSession(response, session.id, filteredQuestions[0].uuid)

        await sendQuestion(waID, filteredQuestions[0].text, filteredQuestions[0].options, filteredQuestions[0].uuid, filteredQuestions[0].expected_answer, messageId.wfID);
        //await updateSession(response,session.id)
    }
}

webhook.get(async (req, res) => {
    const mode = req.query["hub.mode"]
    const challange = req.query["hub.challenge"]
    const token = req.query["hub.verify_token"]

    console.log(req.query, mode, challange, token);

    if (mode === "subscribe" && token === webhookSecret) {
        res.status(200).send(challange);
    }
    else {
        res.status(403).json({
            message: "Failed"
        });
    }
})

webhook.post(async (req, res) => {

    console.log("Webhook Starts")

    assertUp(req.body, {
        message: "Empty request body",
        status: 400
    })

    const data = req.body;
    console.log(req.body);
    

    if (data.entry[0].changes[0].field !== "messages") {
        res.status(403).json({
            message: "Request is not from the messages webhook"
        });

        return;
    }

    const waID = data.entry[0].changes[0].value.contacts[0].wa_id;
    const message = data.entry[0].changes[0].value.messages[0];
    const textBody: string = message.type === "interactive" ? message.interactive.button_reply.title : message.text.body;
    const messageId = message.type === "interactive" ? data.entry[0].changes[0].value.messages[0].interactive.button_reply.id : "Hi";
    console.log("Message Type", messageId.type)
    const assigneDetails = await db.member.findFirst({
        where: {
            phone: `+${waID}`,
        }
    })

    if (assigneDetails === null) {
        console.log("user not registered");
        await sendTextMessage(waID, "You are not registered. Please register your whats number")

        res.status(200).json({
            message: "User not registered"
        });

        return;
    }

    let user_session = await db.user_session.findFirst({
        where: {
            member_id: assigneDetails.id
        }
    })

    if (!user_session) {
        console.log("user session not found");

        user_session = await db.user_session.create({
            data: {
                member_id: assigneDetails.id,
            }
        })
    }

    if (textBody === "Hi") {
        try {
            await handleHiResponse(waID, assigneDetails)
            res.status(200).json({
                message: "Response of Hi - successfull."
            });

            return;
        } catch (e) {
            console.log("Error while handling Hi response :", e);
            return;
        }
    }

    if (message.type) {
        switch (messageId.type) {
            case "wf": {
                try {
                    await handleWFResponse(messageId, user_session, waID)
                    res.status(200).json({
                        message: "First question successfully"
                    });
                    return;
                } catch (e) {
                    console.log(e)
                    res.status(403).json({
                        message: e
                    });
                    return;
                }
            }
            case "QA": {
                try {
                    await handleQuestionResponses(messageId, user_session, waID, textBody)
                    res.status(200).json({
                        message: "Question send successfully"
                    });
                    return;
                } catch (e) {
                    console.log(e)
                    res.status(403).json({
                        message: e
                    });
                    return;
                }
            }
            default: {
                sendTextMessage(waID, "Invalid Response")
            }
        }
    }

    res.status(200).json({
        message: "Successfull"
    });
})

export default webhook.handler;
