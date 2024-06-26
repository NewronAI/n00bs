import NextExpress from "@/helpers/node/NextExpress";
import assertUp from "@/helpers/node/assert/assertUp";
import { db } from "@/helpers/node/db";
import { sendInteractiveMessage, sendTextMessage } from "src/messageHelper";
import { handleHiResponse, handleQuestionResponses, handleWFResponse, handleCommentResponse, checkResponseTime } from "@/helpers/node/webhookHelpers";

const webhook = new NextExpress();
const webhookSecret = process.env.WEBHHOK_SECRET;

interface MessageIdObj {
    type?: string,
    questionUUID?: string,
    value?: string,
    expectedAns?: string,
    wfID?: number
}

webhook.get(async (req, res) => {
    const mode = req.query["hub.mode"]
    const challenge = req.query["hub.challenge"]
    const token = req.query["hub.verify_token"]

    console.log(mode, challenge, token, webhookSecret);

    if (mode === "subscribe" && token === webhookSecret) {
        console.log("Mode = ",mode)
        console.log(token,"=",webhookSecret)
        res.status(200).send(challenge);
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
    console.log("Message ID ------------------------------------> \n", messageId)

    console.log("Extracted important variables", waID, message, textBody, messageId);
    if(waID === undefined || message === undefined){
        res.status(200).json({
            message: "It is not a message."
        });
        return ;
    }

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

        await sendTextMessage(waID, "You are not registered. Please register your whats app number")

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

    const textBodyLowerCase = textBody.toLowerCase()

    if (textBodyLowerCase === "hi") {
        try {
            if(!user_session.has_accepted_policy) {
                await sendInteractiveMessage(waID, {
                    body: {
                        text: "Welcome to Bhasha ChatBot! Please click on below link to accept security policy https://www.whatsapp.com/legal/privacy-policy-eea"
                    },
                    type: "button",
                    action: {
                        buttons: [
                            {
                                type: "reply",
                                reply: {
                                    title: "I agree",
                                    id: JSON.stringify({ type: "PA" }),
                                }
                            }
                        ]
                    }
                });
                res.status(200).json({
                    message: "Policy sent for acceptance"
                });
                return;
            }

            await handleHiResponse(waID, assigneDetails, user_session)
            res.status(200).json({
                message: "Response of Hi - successful."
            });

            return;
        } catch (e) {
            console.log("Error while handling Hi response :", e);
            return;
        }
    }

    if (message?.type === "text" && textBodyLowerCase !== "hi" && user_session.current_question_uuid) {

        console.log("Entering in comment response flow");
        try {
            console.log("Handling Comment response");
            const checkResponse = await handleCommentResponse(waID, user_session, textBody);
            if(checkResponse) {
                const flowID = user_session.check_type;
                console.log("----------Flow ID--------------",flowID);

                await handleWFResponse({ type: "WF", wfID: flowID }, user_session, waID)
            }
        }
        catch (e) {
            console.log(e)
            res.status(403).json({
                message: e
            });
            return;
        }

        res.status(200).json({
            message: "Completed the task assingment, Moving to next one"
        });
        return;
    }

    console.log("parsedMessageId type", parsedMessageId.type);

    switch (parsedMessageId.type) {
        case "PA": {
            console.log("Policy Accepted");
            try {
                await db.user_session.update({
                    where: {
                        id: user_session.id,
                    },
                    data: {
                        has_accepted_policy: true,
                    }
                })
            await sendTextMessage(waID,"Thanks for accepting the policy. Please start the session again by sending ‘Hi’.")
            res.status(200).json({
                message: "Policy Accepted"
            });
            return;
            } catch (error) {
                console.log(error);
                res.status(403).json({
                    message: "Could'nt able to update the Policy Accepted"
                });
                return;
            }
        }
        case "WF": {
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
        }
        case "QA": {
            if(await checkResponseTime(user_session)) {
                try {
                    console.log("Message type is of QA");
                    const completed = await handleQuestionResponses(parsedMessageId, user_session, waID, textBody)
                    if(completed) {
                            const flowID = user_session.check_type;
                            await handleWFResponse({ type: "WF", wfID: flowID }, user_session, waID)
                    }
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
            res.status(200).json({
                message: "Invalid Response"
            });
            return;
        }
    }
})

export default webhook.handler;
