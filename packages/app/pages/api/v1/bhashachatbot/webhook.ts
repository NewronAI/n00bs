import NextExpress from "@/helpers/node/NextExpress";
import assertUp from "@/helpers/node/assert/assertUp";
import {db} from "@/helpers/node/db";
import {events, request_method} from "@prisma/client";

const webhook = new NextExpress();
const myToken = "2d464c63-249b-4c91-8698-45abda5d3b7b"

webhook.get(async (req, res) => {
    const mode = req.query["hub.mode"]
    const challange = req.query["hub.challange"]
    const token = req.query["hub.token"]

    if(mode === "subscribe" && token === myToken) {
        res.status(200).send(challange);
    }
    else {
        res.status(403).json({
            message: "Failed"
        });
    }
})


webhook.post(async (req, res) => {
    const body_param = req.body
    console.log("Body: ", body_param)

    res.status(200).json("successfull")

})

export default webhook.handler;