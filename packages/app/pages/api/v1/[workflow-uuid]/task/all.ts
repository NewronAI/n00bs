import NextExpress from "@/helpers/node/NextExpress";
import { db } from "@/helpers/node/db";
import { task_status } from "@prisma/client";
import getLogger from "@/helpers/node/getLogger";

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

    // const assignee = await db.member.findFirst({
    //     where: {
    //         id: 142
    //     }
    // })

    // console.log("Kasmi Details", assignee);

    // const kasmiTasks = await db.task_assignment.deleteMany({
    //     where: {
    //         status: task_status.pending,
    //         assignee_id: 142,
    //         workflow_file: {
    //             state: 'Bihar'
    //         },
    //         task: {
    //             workflow: {
    //                 uuid: workflowUUID
    //             }
    //         }
    //     }
    // })
    // console.log("Kasmi total Task ------------------------------------------------------------------------------------------------------------------", kasmiTasks.length);

    //logger.debug(`task : ${JSON.stringify(tasks)}`);

    res.status(200).json(tasks);

});


export default openTasksApi.handler;