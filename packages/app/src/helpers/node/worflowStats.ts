import { db } from "./db";
import { task_status } from "@prisma/client";

type TotalAssignments = { count: number };
export async function getFilesCount(id: number, vendor? : string) {
    const filesCount = await db.workflow_file.count({
        where: {
            workflow: {
                id: id,
            },
            status: "active",
            vendor: vendor
        }
    });
    return filesCount;
}

export async function getAssignedFilesCount(workflowUUID: string, vendor : string | null = null) {

    const assignedFilesCount: TotalAssignments[] = (await db.$queryRaw`
        WITH
            wf_id AS (
                SELECT workflow.id as id FROM workflow where workflow.uuid = ${workflowUUID}
            ),
            reqdcount as
                (SELECT t.min_assignments FROM task t INNER JOIN workflow w ON t.workflow_id = w.id WHERE w.id = (SELECT id FROM wf_id)),
            assignments AS (SELECT ta.workflow_file_id, count(assignee_id) FROM task_assignment ta
                                                                                    INNER JOIN workflow_file wf ON ta.workflow_file_id = wf.id WHERE wf.workflow_id = (SELECT id FROM wf_id) GROUP BY ta.workflow_file_id)
        SELECT count(workflow_file_id) ::text FROM assignments WHERE count >= (SELECT * FROM reqdcount);
    `) as TotalAssignments[];

    return assignedFilesCount[0].count;

}


export async function getAssignedJobsCount(id: number, vendor? : string) {
    const assignedJobsCount = await db.task_assignment.count({
        where: {
            workflow_file: {
                workflow: {
                    id: id
                },
                vendor: vendor
            },
            status: {
                not: task_status.cancelled
            }
        }
    });
    return assignedJobsCount;
}

export async function getPendingJobsCount(id: number, vendor? : string) {
    const pendingJobsCount = await db.task_assignment.count({
        where: {
            workflow_file: {
                workflow: {
                    id: id
                },
                vendor: vendor
            },
            status: task_status.pending
        }
    });
    return pendingJobsCount;
}

export async function getCompletedJobsCount(id: number, vendor? : string) {
    const completedJobsCount = await db.task_assignment.count({
        where: {
            AND: {
                workflow_file: {
                    workflow: {
                        id: id,
                    },
                    vendor: vendor
                },
                OR: [
                    { status: task_status.completed },
                    { status: task_status.rejected },
                    { status: task_status.accepted },
                    { status: task_status.in_progress }, // In progress means, answer received, but not yet reviewed
                ]
            }
        }
    });
    return completedJobsCount;
}

export async function getCompletedFilesCount(id: number, vendor? : string) {
    const completedFilesCount = await db.workflow_file.count({
        where: {
            workflow: {
                id: id
            },
            vendor: vendor,
            task_assignments: {
                some: {
                    status: "accepted"
                }
            }
        }
    });
    return completedFilesCount;
}
