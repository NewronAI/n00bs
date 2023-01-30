import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";

import {task_status} from "@prisma/client"

const dashboardStatsApi = new NextExpress()

type TotalAssignments = {total_assignments: number};
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

    const assignedFilesCount : TotalAssignments[] = (await db.$queryRaw`
        SELECT count(workflow_file.id)::int as total_assignments
        FROM workflow_file
                 INNER JOIN task_assignment ON task_assignment.workflow_file_id = workflow_file.id
            AND workflow_file.id in
                (SELECT workflow_file.id as total_assignments
                 FROM workflow_file
                          INNER JOIN workflow ON workflow.uuid = ${workflowUUID}
                          LEFT JOIN task_assignment ON workflow_file.id = task_assignment.workflow_file_id
                 GROUP BY workflow_file.id, task_assignment.task_id
                 HAVING COUNT(task_assignment.task_id) >= (SELECT task.min_assignments FROM task
                                                                                                INNER JOIN workflow ON workflow.uuid = ${workflowUUID}
                     AND task.workflow_id = workflow.id ORDER BY task.id LIMIT 1))
    `) as TotalAssignments[];

    console.log(assignedFilesCount);

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
            workflow_file: {
                workflow: {
                    uuid: workflowUUID
                }
            },
            status: task_status.completed
        }
    });



    res.status(200).json({
        filesCount,
        assignedFilesCount : assignedFilesCount[0].total_assignments,
        assignedJobsCount,
        pendingJobsCount,
        completedJobsCount
    });

})


export default dashboardStatsApi.handler

