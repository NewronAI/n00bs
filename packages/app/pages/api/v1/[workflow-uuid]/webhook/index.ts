import NextExpress from "@/helpers/node/NextExpress";
import assertUp from "@/helpers/node/assert/assertUp";
import {db} from "@/helpers/node/db";
import {events, request_method} from "@prisma/client";

const webhookManagementAPI = new NextExpress();

webhookManagementAPI.get(async (req, res) => {

    const workflowUUID = req.query["workflow-uuid"] as string;

    assertUp(workflowUUID, {
        status: 400,
        message: "workflow-uuid: Param is required. Should contain the uuid of the workflow"
    });

    const webhooks = await db.webhook.findMany({
        where: {
            workflow: {
                uuid: workflowUUID
            }
        }
    });

    res.status(200).json(webhooks)
})


webhookManagementAPI.post(async (req, res) => {

    const workflowUUID = req.query["workflow-uuid"] as string;

    assertUp(workflowUUID, {
        status: 400,
        message: "workflow-uuid: Param is required. Should contain the uuid of the workflow"
    });

    const url = req.body.url as string;
    const name = req.body.name as string;
    const secret = req.body.secret as string;
    const method = req.body.method as request_method;
    const event = req.body.event as events;

    assertUp(url, {
        status: 400,
        message: "url: Body Param is required. Should contain the url of the webhook"
    });

    assertUp(name, {
        status: 400,
        message: "name: Body Param is required. Should contain the name of the webhook"
    });

    assertUp(method, {
        status: 400,
        message: "method: Body Param is required. Should contain the method of the webhook"
    });

    assertUp(event, {
        status: 400,
        message: "event: Body Param is required. Should contain the event of the webhook"
    });

    // secret is optional

    const webhook = await db.webhook.create({
        data: {
            workflow: {
                connect: {
                    uuid: workflowUUID
                }
            },
            url: url,
            name: name,
            secret: secret,
            method: method,
            event: event
        }
    });

    res.status(200).json(webhook);

})


webhookManagementAPI.delete(async (req, res) => {

    const webhookUUID = req.query["webhook-uuid"] as string;

    assertUp(webhookUUID, {
        status: 400,
        message: "webhook-uuid: Param is required. Should contain the uuid of the webhook"
    });

    const webhook = await db.webhook.delete({
        where: {
            uuid: webhookUUID
        }
    });

    res.status(200).json(webhook);

});

export default webhookManagementAPI.handler;