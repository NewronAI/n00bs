import {events} from "@prisma/client";
import {db} from "@/helpers/node/db";
import getLogger from "@/helpers/node/getLogger";
import axios from "axios";
import * as process from "process";


type MessageTemplate = {
    heading?: string,
    type?: string,
    time?: string,
    desc?: string,
    reason?: string
    rawData? : any
}

const slackMessageTemplate = ({heading,type, time,desc, reason , rawData } : MessageTemplate) => ( {
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
                "text": `env: ${process.env.NEXT_PUBLIC_APP_ENV}\n ${type && `*Type:*\n${type}\n`}${time && `*When:*\n${time}\n`}${desc && `*Desc:* ${desc}\n*`}${reason && `Reason:* ${reason}\n ${rawData && JSON.stringify(rawData,null,2)}`}`
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

    const logger = getLogger(`webhookHandler ${event} , ${workflowUUID}` );

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

    console.log("workflow", workflow);

    const webhooks = workflow?.webhooks;
    logger.debug("webhooks", webhooks);

       if(!webhooks){
           logger.debug("No webhooks found for this workflow");
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


       logger.debug("calling webhooks");
       for(const webhook of webhooks){

           logger.debug("webhook", webhook);
           let isSlack = isSlackWebhook(webhook);
           logger.debug("isSlackWebhook", isSlack);


              if(isSlack){
                   const message = slackMessageTemplate({
                       ...slackMessageForEvent.get(event),
                       time: new Date().toLocaleString(),
                       rawData
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

                    const reportingURL = process.env.ERROR_REPORTING_WEBHOOK;

                    if(reportingURL){
                        try {
                            await axios( {
                                url: reportingURL,
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                data: {
                                    "blocks": [
                                        {
                                            "type": "section",
                                            "text": {
                                                "type": "mrkdwn",
                                                "text": `*Error while sending webhook:* ${webhook.url},  Env : ${process.env.NEXT_PUBLIC_APP_ENV}`
                                            }
                                        },
                                        {
                                            "type": "section",
                                            "text": {
                                                "type": "mrkdwn",
                                                "text": `*Error:* ${e}`
                                            }
                                        },
                                        {
                                            "type": "section",
                                            "text": {
                                                "type": "mrkdwn",
                                                "text": `*Raw Data:* ${JSON.stringify(rawData,null,2)}`
                                            }
                                        }
                                    ]
                                }
                            });
                        } catch (e) {
                            logger.error(`Error while sending report webhook : ${webhook.url}`);
                            logger.error(e);
                        }
                    }



                }
       }
}

export default webhookHandler