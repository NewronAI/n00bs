import NextExpress from "@/helpers/node/NextExpress";
import assertUp from "@/helpers/node/assert/assertUp";
import { db } from "@/helpers/node/db";
import { events, request_method } from "@prisma/client";
import { sendTextMessage, sendTemplateMessage, sendInteractiveMessage} from "src/messageHelper";

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

    if (!req.body) {
        res.status(400).json({
          message: "Empty request body",
        });
        return;
      }
    
    console.log(req.body);
    
    const data = req.body;

    if(data.entry[0].changes[0].field !== "messages") {
        res.status(403).json({
            message: "Request is not from the messages webhook"
        });
    }

    const waID = data.entry[0].changes[0].value.contacts[0].wa_id;
    const textBody = data.entry[0].changes[0].value.messages[0].text.body;

    const assigneDetails = await db.member.findFirst({
        where: {
            phone: `+${waID}`,
        }
    })

    if(assigneDetails === null){
        console.log("user not registered");
        await sendTextMessage(waID, "You are not registered. Please register your whats number")

        res.status(200).json({
            message: "User not registered"
        });
        return;
    } else {
        console.log("Assignee", assigneDetails);
        const task_assignments = await db.task_assignment.findMany({
            where: {
                assignee_id: assigneDetails.id
            },
        })
        if(task_assignments === null){
            console.log("No Task Assinged")
            await sendTextMessage(waID, "You have no task assinged. Enjoy your day")
        }
        res.status(200).json({
            message: "No task assinged"
        });
        return;
    }

    // await sendInteractiveMessage(waID, {
    //     body: {
    //         text: "Would you like to continue?"
    //     },
    //     type: "button",
    //     action: {
    //         buttons: [
    //             {
    //                 type: "reply",
    //                 reply : {
    //                     title: "Yes",
    //                     id: "3Q Q1 Yes"
    //                 }
    //             },
    //             {
    //                 type: "reply",
    //                 reply : {
    //                     title: "No",
    //                     id: "3Q Q1 No"
    //                 }
    //             }
    //         ]
    //     }
    //    });

    res.status(200).json("successfull")
})

export default webhook.handler;
