import NextExpress from "@/helpers/node/NextExpress";
import assertUp from "@/helpers/node/assert/assertUp";
import { db } from "@/helpers/node/db";
import { events, request_method } from "@prisma/client";
import { sendTextMessage, sendQuestion, sendInteractiveMessage } from "src/messageHelper";
import { task_status } from "@prisma/client";

const webhook = new NextExpress();
const webhookSecret = "2d464c63-249b-4c91-8698-45abda5d3b7b"

async function checkSession(assignee_id: any) {
    const session = await db.user_session.findFirst({
        where: {
            member_id: assignee_id
        },
    });

    if (session) {
        return true;
    }
    else {
        const newSession = await db.user_session.create({
            data: {
                member_id: assignee_id,
            }
        })
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

    if (!req.body) {
        res.status(400).json({
            message: "Empty request body",
        });
        return;
    }

    const data = req.body;

    if (data.entry[0].changes[0].field !== "messages") {
        res.status(403).json({
            message: "Request is not from the messages webhook"
        });

        return;
    }

    const waID = data.entry[0].changes[0].value.contacts[0].wa_id;
    const textBody = data.entry[0].changes[0].value.messages[0].text.body;

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

    if(!user_session) {
        console.log("user session not found");

        user_session = await db.user_session.create({
            data: {
                member_id: assigneDetails.id,
            }
        })
    }

    sendTextMessage(waID, `Welcome ${assigneDetails.name}`)

    const task_assignments = await db.task_assignment.findMany({
        where: {
            assignee_id: assigneDetails.id,
            status: task_status.in_progress,
        },
    })

    const single_audio_assingments = task_assignments.filter(task => task.workflow_file_id === 1)
    const district_audio_assignments = task_assignments.filter(task => task.workflow_file_id === 2)
    const transcription_check_assignments  = task_assignments.filter(task => task.workflow_file_id === 2)

    await sendInteractiveMessage(waID, {
        body: {
            text: `You have these many assignments assigned to you.
                Single Audio - ${single_audio_assingments.length}
                District Wise Audio - ${district_audio_assignments.length}
                Transcription Check - ${transcription_check_assignments.length}
            `
        },
        type: "button",
        action: {
            buttons: [
                {
                    type: "reply",
                    reply : {
                        title: "Single Audio",
                        id: "single_audio"
                    }
                },
                {
                    type: "reply",
                    reply : {
                        title: "District wise Audio",
                        id: "district_audio"
                    }
                },
                {
                    type: "reply",
                    reply : {
                        title: "Transcription Check",
                        id: "transcription_check"
                    }
                }
            ]
        }
       });

       res.status(200).json({
        message: "Successfull"
    });

})

export default webhook.handler;
