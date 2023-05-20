import NextExpress from "@/helpers/node/NextExpress";
import assertUp from "@/helpers/node/assert/assertUp";
import { db } from "@/helpers/node/db";
import { sendTextMessage } from "src/messageHelper";
import { handleHiResponse, handleQuestionResponses, handleWFResponse, handleCommentResponse, checkResponseTime } from "@/helpers/node/webhookHelpers";
import { Session } from "@auth0/nextjs-auth0";

const webhook = new NextExpress();
const webhookSecret = "2d464c63-249b-4c91-8698-45abda5d3b7b"


interface MessageIdObj {
    type?: string,
    questionUUID?: string,
    value?: string,
    expectedAns?: string,
    wfID?: number
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
    console.log(JSON.stringify(req.body, null, 2));

    if (data.entry[0].changes[0].field !== "messages") {
        res.status(403).json({
            message: "Request is not from the messages webhook"
        });

        return;
    }

    console.log("Extracting values");

    const waID = data.entry?.[0]?.changes?.[0]?.value.contacts?.[0]?.wa_id;
    const message = data.entry?.[0]?.changes?.[0]?.value.messages?.[0];
    const textBody: string = message?.type === "interactive" ? message?.interactive?.button_reply?.title : message?.text?.body;
    const messageId = message?.type === "interactive" ? data.entry?.[0]?.changes?.[0]?.value?.messages?.[0].interactive?.button_reply?.id : undefined;

    console.log("Extracted important variables", waID, message, textBody, messageId);

    let parsedMessageId: MessageIdObj = {};

    try {
        parsedMessageId = JSON.parse(messageId);
    }
    catch (e) {
        console.log("could not parse the id string", "treating as normal message");
    }

    console.log("Message Type", parsedMessageId.type);

    const assigneDetails = await db.member.findFirst({
        where: {
            phone: `+${waID}`,
        }
    });

    console.log("Fetched assignee details");

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
    console.log("Searched for user session. Found : ", !!user_session);

    if (!user_session) {
        console.log("user session not found");
        user_session = await db.user_session.create({
            data: {
                member_id: assigneDetails.id,
            }
        })
    }

    console.log("User Session", user_session)

    if (textBody === "Hi") {
        try {
            await handleHiResponse(waID, assigneDetails, user_session)
            res.status(200).json({
                message: "Response of Hi - successfull."
            });

            return;
        } catch (e) {
            console.log("Error while handling Hi response :", e);
            return;
        }
    }

    if (message?.type === "text" && textBody !== "Hi" && user_session.current_question_uuid) {

        console.log("Entering in comment response flow");
        try {
            console.log("Handling Comment response");
            await handleCommentResponse(waID, user_session, textBody);
        }
        catch (e) {
            console.log(e)
            res.status(403).json({
                message: "Error in handling error response"
            });
            return;
        }

        const flowID = user_session.check_type === "single_audio" ? 1 : user_session.check_type === "district_wise_audio" ? 2 : 3
        await handleWFResponse({ type: "WF", wfID: flowID }, user_session, waID)

        res.status(200).json({
            message: "Completed the task assingment, Moving to next one"
        });
        return;
    }

    switch (parsedMessageId.type) {
        case "WF": {
            if(await checkResponseTime(user_session)) {
                try {
                    console.log("Message type detected as worflow selection");
                    await handleWFResponse(parsedMessageId, user_session, waID)
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
            } else {
                await sendTextMessage(waID,"You have not responded within time limit. Please try again.")
                res.status(200).json({
                    message: "Session expired. Not responded within time limit"
                });
                return;
            }
        }
        case "QA": {
            if(await checkResponseTime(user_session)) {
                try {
                    console.log("Message type is of QA");
                    await handleQuestionResponses(parsedMessageId, user_session, waID, textBody)
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
            } else {
                await sendTextMessage(waID,"You have not responded within time limit. Please try again.")
                res.status(200).json({
                    message: "Session expired. Not responded within time limit"
                });
                return;
            }
        }
        default: {
            sendTextMessage(waID, "Invalid Response")
        }
    }
})

export default webhook.handler;
