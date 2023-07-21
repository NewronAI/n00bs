import NextExpress from "@/helpers/node/NextExpress";
import assertUp from "@/helpers/node/assert/assertUp";
import getPublicWorkflowAPISecret from "@/helpers/getPublicWorkflowAPISecret";
import {db} from "@/helpers/node/db";

export const config = {
    api: {
      responseLimit: false,
    },
  }

const questionsApi = new NextExpress();


questionsApi.get(async (req, res) => {

    const workflowUuid = req.query?.["workflow-uuid"] as string;

    assertUp(workflowUuid, {
        message: "Workflow UUID: Param is required. Should contain the uuid of the workflow",
        status: 400
    });

    const secret = req.query?.secret as string;

    assertUp(secret, {
        message: "Secret: Param is required. Should contain the secret of the workflow",
        status: 400
    });

    const questions = await db.question.findMany({
        where: {
            task_question: {
                some: {
                    task: {
                        workflow: {
                            uuid: workflowUuid
                        }
                    }
                }
            }
        }
    })

    res.status(200).json(questions);

});


export default questionsApi.handler;