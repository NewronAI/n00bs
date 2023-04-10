import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";
import {task_status} from "@prisma/client";

const openTasksApi = new NextExpress();

// API will return the list of current task in the workflow
openTasksApi.get(async (req, res) => {

    const workflowUUID = req.query["workflow-uuid"] as string;

    const tasks = await db.task_assignment.findMany({
        where: {
            status: task_status.in_progress,
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

    res.status(200).json(tasks);

});


export default openTasksApi.handler;