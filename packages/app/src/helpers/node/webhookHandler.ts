import {events} from "@prisma/client";
import {db} from "@/helpers/node/db";
import getLogger from "@/helpers/node/getLogger";
import axios from "axios";


type MessageTemplate = {
    heading?: string,
    type?: string,
    time?: string,
    desc?: string,
    reason?: string
}

const slackMessageTemplate = ({heading,type, time,desc, reason } : MessageTemplate) => ( {
    "blocks": [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `*Worfkflow:* ${heading}`
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `${type && `*Type:*\n${type}\n`}${time && `*When:*\n${time}\n`}${desc && `*Desc:* ${desc}\n*`}${reason && `Reason:* \"${reason}\"`}`
            },
            "accessory": {
                "type": "image",
                "image_url": "https://newron.ai/newron-logo2x.png",
                "alt_text": "newron-logo"
            }
        }
    ]
})


function isSlackWebhook(webhook: any): boolean {
    const slackUrlRegex = /https:\/\/hooks.slack.com/ig;
    return slackUrlRegex.test(webhook.url);
}

const webhookHandler = async (event: events, workflowUUID : string, rawData : any) => {

    const logger = getLogger('webhookHandler');

    const workflow = await db.workflow.findFirst({
        where: {
            uuid: workflowUUID
        },
        include: {
            webhooks: {
                where: {
                    event: event
                }
            }
        }
    });

    const webhooks = workflow?.webhooks;
    console.log("webhooks", webhooks);

       if(!webhooks){
           logger.debug("No webhooks found for this workflow");
           console.log("No webhooks found for this workflow");
           return;
       }

        const slackMessageForEvent = new Map<events, MessageTemplate>([
            [
                events.task_assignment_created, {
                heading: `Workflow : ${workflow?.name}`,
                type: "Task(s) Created",
                desc: "New task assignments(s) created",
            }]
        ]);

       for(const webhook of webhooks){

           console.log("webhook", webhook);
              if(isSlackWebhook(webhook)){
                   const message = slackMessageTemplate({
                       ...slackMessageForEvent.get(event),
                       time: new Date().toLocaleString()
                   })

                  try {
                      await axios( {
                            url: webhook.url,
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            data: message
                      });
                  } catch (e) {
                       logger.error(`Error while sending webhook : ${webhook.url}`);
                       logger.error(e);
                  }
                  finally {
                      continue;
                  }
              }

              try {

                  const secretHeader = webhook.secret ? {
                        'secret': webhook.secret
                      } : {};

                    await axios( {
                        url: webhook.url,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...secretHeader
                        },
                        data: { data :  rawData }
                  });

              }
                catch (e) {
                    logger.error(`Error while raw sending webhook : ${webhook.url}`);
                    logger.error(e);
                }
       }
}

export default webhookHandler