import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";
import {task_status} from "@prisma/client";
import getLogger from "@/helpers/node/getLogger";

export const config = {
    api: {
      responseLimit: false,
    },
  }

const openTasksApi = new NextExpress();

// API will return the list of current task in the workflow
openTasksApi.get(async (req, res) => {

    const workflowUUID = req.query["workflow-uuid"] as string;

    const logger = getLogger(`/api/v1/${workflowUUID}/task/all`);


    const tasks = await db.task_assignment.findMany({
        where: {
            status: task_status.pending,
            task: {
                workflow: {
                    uuid: workflowUUID
                }
            }
        },
        include: {
            task: true,
            workflow_file: true,
            assignee: true
        },
        orderBy: [
            {
                createdAt: "desc"
            }
        ]
    });

    logger.debug(`task : ${JSON.stringify(tasks)}`);

    res.status(200).json(tasks);

});


export default openTasksApi.handler;