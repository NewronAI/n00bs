import NextExpress from "@/helpers/node/NextExpress";
import assertUp from "@/helpers/node/assert/assertUp";
import { db } from "@/helpers/node/db";
import { check_type, events, request_method } from "@prisma/client";
import { sendTextMessage, sendQuestion, sendInteractiveMessage } from "src/messageHelper";
import { task_status } from "@prisma/client";
import axios from "axios";
import { values } from "lodash";

const webhook = new NextExpress();
const webhookSecret = "2d464c63-249b-4c91-8698-45abda5d3b7b"

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

    console.log(JSON.stringify(data, null, 2))

    if (data.entry[0].changes[0].field !== "messages") {
        res.status(403).json({
            message: "Request is not from the messages webhook"
        });

        return;
    }

    const waID = data.entry[0].changes[0].value.contacts[0].wa_id;
    const message = data.entry[0].changes[0].value.messages[0];
    const textBody: any = message.type === "interactive" ? message.interactive.button_reply.title : message.text.body;
    const messageId = message.type === "interactive" ? data.entry[0].changes[0].value.messages[0].interactive.button_reply.id : null;

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

    const task_assignments = await db.task_assignment.findMany({
        where: {
            assignee_id: assigneDetails.id,
            status: task_status.in_progress,
        },
        include: {
            task: true,
            workflow_file: true
        }
    })

    const single_audio_assingments = task_assignments.filter(task => task.task.workflow_id === 1)
    const district_audio_assignments = task_assignments.filter(task => task.task.workflow_id === 2)
    const transcription_check_assignments = task_assignments.filter(task => task.task.workflow_id === 3)

    if (textBody === "Hi") {
        await sendTextMessage(waID, `Welcome ${assigneDetails.name}`)
        await sendInteractiveMessage(waID, {
            body: {
                text: `You have these many assignments assigned to you.

    Single Audio - ${single_audio_assingments.length}
    District Wise Audio - ${district_audio_assignments.length}
    Transcription Check - ${transcription_check_assignments.length}

Please select any one option.`
            },
            type: "button",
            action: {
                buttons: [
                    {
                        type: "reply",
                        reply: {
                            title: "Single Audio",
                            id: "single_audio"
                        }
                    },
                    {
                        type: "reply",
                        reply: {
                            title: "District wise Audio",
                            id: "district_audio"
                        }
                    },
                    {
                        type: "reply",
                        reply: {
                            title: "Transcription Check",
                            id: "transcription_check"
                        }
                    }
                ]
            }
        });

        res.status(200).json({
            message: "Response of Hi - successfull."
        });

        return;
    }
    if (messageId === "single_audio" || messageId === "district_audio" || messageId === "transcription_check") {

        const checkType = messageId === "single_audio" ? check_type.single_audio : messageId === "district_audio" ? check_type.district_wise_audio : messageId === "transcription_check" ? check_type.district_wise_transcript : null;
        const currentTaskAssignment = checkType === check_type.single_audio ? single_audio_assingments[0] : checkType === check_type.district_wise_audio ? district_audio_assignments[0] : checkType === check_type.district_wise_transcript ? transcription_check_assignments[0] : null;
        const workflow_id = checkType === check_type.single_audio ? 1 : checkType === check_type.district_wise_audio ? 2 : checkType === check_type.district_wise_transcript ? 3 : null;
        const fileName = currentTaskAssignment?.workflow_file.file_name.split("/").pop();
        const fileLink = currentTaskAssignment?.workflow_file.file;

        const questions = await db.task_assignment.findMany({
            where: {
                id: currentTaskAssignment?.id
            },
            select: {
                task: {
                    select: {
                        task_questions: {
                            select: {
                                questions: {
                                    select: {
                                        id: true,
                                        uuid: true,
                                        name: true,
                                        text: true,
                                        expected_answer: true,
                                        options: true,
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        const responsesJSON: { [key: number]: number | string } = {};
        questions[0].task.task_questions.map(question => {
            const id = question.questions.id;
            responsesJSON[id] = 0;
        })

        try {
            await db.user_session.update({
                where: {
                    id: user_session.id
                },
                data: {
                    current_question_uuid: Object.keys(responsesJSON)[0],
                    task_assignment_id: currentTaskAssignment?.id,
                    check_type: checkType,
                    responses: responsesJSON
                }
            })
        } catch (e) {
            console.log("Error while updating the user_session", e)
            return;
        }

        const firstQuestion = questions[0].task.task_questions.find(question => question.questions.uuid === Object.keys(responsesJSON)[0])

        await sendTextMessage(waID, `File Name - ${fileName}.

Please visit the below link to view the file.

${fileLink}`)

        await sendQuestion(waID, firstQuestion?.questions.text, firstQuestion?.questions.options, `workflowID_${workflow_id}_${firstQuestion?.questions.uuid}`)

        res.status(200).json({
            message: `Selected ${textBody} workflow`
        });
        return;
    }

    const checkAnswer = messageId.split("_")

    if (checkAnswer[0] === "workflowID") {

        const responses = user_session.responses;
        responses?[user_session.current_question_uuid] : textBody;

        console.log("Responses", responses);

        res.status(200).json({
            message: `Answer recieved`
        });
        return;
    }

    res.status(200).json({
        message: "Successfull"
    });
})

export default webhook.handler;
