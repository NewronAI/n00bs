import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";

import {task_status} from "@prisma/client"

const dashboardStatsApi = new NextExpress()

type TotalAssignments = {count: number};
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
        WITH
            wf_id AS (
                SELECT id FROM workflow WHERE uuid = ${workflowUUID}
            ),
            reqdcount as
                (SELECT t.min_assignments FROM task t INNER JOIN workflow w ON t.workflow_id = w.id WHERE w.id = (SELECT id FROM wf_id)),
            assignments AS (SELECT ta.workflow_file_id, count(assignee_id) FROM task_assignment ta
                                                                                    INNER JOIN workflow_file wf ON ta.workflow_file_id = wf.id WHERE wf.workflow_id = (SELECT id FROM wf_id) GROUP BY ta.workflow_file_id)
        SELECT count(workflow_file_id) FROM assignments WHERE count >= (SELECT * FROM reqdcount);
    `) as TotalAssignments[];


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
        assignedFilesCount : assignedFilesCount[0].count,
        assignedJobsCount,
        pendingJobsCount,
        completedJobsCount
    });

})


export default dashboardStatsApi.handler

