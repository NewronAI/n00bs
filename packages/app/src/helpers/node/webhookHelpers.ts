import { sendTextMessage, sendQuestion, sendInteractiveMessage } from "src/messageHelper";
import { db } from "@/helpers/node/db";
import assertUp from "./assert/assertUp";

export async function handleHiResponse(waID: any, assigneDetails: any) {

    console.log("sending hi response", waID, assigneDetails);

    await sendTextMessage(waID, `Welcome ${assigneDetails.name}!`);
    console.log("welcome message sent");
    


    const workflows = await db.workflow.findMany({
        include: {
            tasks: true
        },
        orderBy: {
            id: "asc"
        }
    });
    console.log("fetched workflows");
    

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
    console.log("fetched all counts");

    const toSendMessage = `You have following number of tasks:\n\n${workflows.map(({ name }, index) => {
        return `${name}  : ${countValues[index]}`
    }).join("\n")}`;

    const buttons = workflows.map((flow) => {
        return {
            type: "reply",
            reply: {
                title: flow.id === 1 ? "Single Audio Check" : "District Audio Check",
                id: JSON.stringify({ type: "WF", wfID: flow.id }),
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

    console.log("sent user count");
    
}

export async function getTaskAssingment(workflowID: number, assigneeID: any) {
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

export async function getQuestions(wfID: number, task_assignmentID: any) {
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

export async function handleWFResponse(messageId: any, session: any, waID: number) {

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

export async function updateSession(responses: any, sessionID: any, current_question_uuid: string) {
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

export async function handleQuestionResponses(messageId: any, session: any, waID: number, textBody: any) {
    if (messageId.expectedAns === textBody || messageId.wfID === 2) {
        const task_assignment_id = session.task_assignment_id
        const response = session.responses;
        response[messageId.questionUUID] = textBody;
        const questions = await getQuestions(messageId.wfID, task_assignment_id)
        const filteredQuestions = questions?.filter(question => {
            if (response[question.uuid] !== "null") {
                return question;
            }
        })
        if (!filteredQuestions) {
            return
        }


        console.log("Session", JSON.stringify(session))
        await updateSession(response, session.id, filteredQuestions[0].uuid)

        await sendQuestion(waID, filteredQuestions[0].text, filteredQuestions[0].options, filteredQuestions[0].uuid, filteredQuestions[0].expected_answer, messageId.wfID);
        //await updateSession(response,session.id)
    }
}