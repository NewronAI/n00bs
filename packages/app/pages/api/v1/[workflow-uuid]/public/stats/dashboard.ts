import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";

import {task_status} from "@prisma/client"
import {getAssignedFilesCount} from "@/helpers/node/worflowStats";

export const config = {
    api: {
      responseLimit: false,
    },
  }

const dashboardStatsApi = new NextExpress()


dashboardStatsApi.get(async (req, res) => {

    const workflowUUID = req.query["workflow-uuid"] as string;

    const filesCount = await db.workflow_file.count({
        where: {
            workflow: {
                uuid: workflowUUID
            },
            status: "active"
        }
    });

    const assignedFilesCount : number = await getAssignedFilesCount(workflowUUID);


    const assignedJobsCount = await db.task_assignment.count({
        where: {
            workflow_file: {
                workflow: {
                    uuid: workflowUUID
                }
            },
            status: {
                not: task_status.cancelled
            }
        }
    });

    const pendingJobsCount = await db.task_assignment.count({
        where: {
            workflow_file: {
                workflow: {
                    uuid: workflowUUID
                }
            },
            status: task_status.pending
        }
    });

    const completedJobsCount = await db.task_assignment.count({
        where: {
            AND: {
                workflow_file: {
                    workflow: {
                        uuid: workflowUUID,
                    },
                },
                OR: [
                    {status: task_status.completed},
                    {status: task_status.rejected},
                    {status: task_status.accepted},
                    {status: task_status.in_progress}, // In progress means, answer received, but not yet reviewed
                ]
            }
        }
    });



    res.status(200).json({
        filesCount,
        assignedFilesCount,
        assignedJobsCount,
        pendingJobsCount,
        completedJobsCount
    });

})


export default dashboardStatsApi.handler

