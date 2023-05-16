import NextExpress from "@/helpers/node/NextExpress";
import assertUp from "@/helpers/node/assert/assertUp";
import { db } from "@/helpers/node/db";
import { events, request_method } from "@prisma/client";
import { sendMessage, sendTemplateMessage} from "src/messageHelper";

const webhook = new NextExpress();
const myToken = "2d464c63-249b-4c91-8698-45abda5d3b7b"
const authorizationToken = "EAASzAN1WZAS8BAANrSJVlLyOWNsYnW5EGdzYkrSPsSNg2ZAtscgcgIZAzTDZBWbLbkIZCGs3eEon5hzppSxWLTJ7gdYfI9BkS1ofPAfsUkmeIYGH93ZB6n3Mun1xZAR10t9XghP6wDAyaxrx1qewP8CIZCMIzfhkEhKe7ZAvx3MQs0EzZCoBZBCANBwTriDCW7JWyhFQZBK5i6VTqgDnxw4KL1E8X8aHz33smzkZD"

webhook.get(async (req, res) => {
    const mode = req.query["hub.mode"]
    const challange = req.query["hub.challenge"]
    const token = req.query["hub.verify_token"]

    console.log(req.query, mode, challange, token);

    if (mode === "subscribe" && token === myToken) {
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
            phone: waID,
        }
    })

    if(assigneDetails === null){
        console.log("user not registered");
        await sendMessage(authorizationToken, waID, "You are not registered. Please register your whats number")
        res.status(200).json({
            message: "User not registered"
        });
    }

    res.status(200).json("successfull")
})

export default webhook.handler;
