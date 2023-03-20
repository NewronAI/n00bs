import { db } from "./db";
import {task_status} from "@prisma/client";

type TotalAssignments = {total_assignments: number};
export async function getFilesCount(id : number) {
    const filesCount = await db.workflow_file.count({
        where: {
            workflow: {
                id: id
            },
            status: "active"
        }
    });
    return filesCount;
}

export async function getAssignedFilesCount(id : number) {
    const assignedFilesCount : TotalAssignments[] = (await db.$queryRaw`
        SELECT count(workflow_file.id)::int as total_assignments
        FROM workflow_file
                 INNER JOIN task_assignment ON task_assignment.workflow_file_id = workflow_file.id
            AND workflow_file.id in
                (SELECT workflow_file.id as total_assignments
                 FROM workflow_file
                          INNER JOIN workflow ON workflow.id = ${id} AND workflow_file.workflow_id = workflow.id
                          LEFT JOIN task_assignment ON workflow_file.id = task_assignment.workflow_file_id
                 GROUP BY workflow_file.id, task_assignment.task_id
                 HAVING COUNT(task_assignment.task_id) >= (SELECT task.min_assignments FROM task
                                                                                                INNER JOIN workflow ON workflow.id = ${id}
                     AND task.workflow_id = workflow.id ORDER BY task.id LIMIT 1))
    `) as TotalAssignments[];
    return assignedFilesCount;
}


export async function getAssignedJobsCount(id : number) {
    const assignedJobsCount = await db.task_assignment.count({
        where: {
            workflow_file: {
                workflow: {
                    id: id
                }
            },
            status: {
                not: task_status.cancelled
            }
        }
    });
    return assignedJobsCount;
}

export async function getPendingJobsCount(id : number) {
    const pendingJobsCount = await db.task_assignment.count({
        where: {
            workflow_file: {
                workflow: {
                    id: id
                }
            },
            status: task_status.pending
        }
    });
    return pendingJobsCount;
}

export async function getCompletedJobsCount(id : number) {
    const completedJobsCount = await db.task_assignment.count({
        where: {
            workflow_file: {
                workflow: {
                    id: id
                }
            },
            status: task_status.completed
        }
    });
    return completedJobsCount;
}

export async function getCompletedFilesCount(id : number) {
    const completedFilesCount = await db.workflow_file.count({
        where: {
            workflow: {
                id: id
            },
            calculated: true
        }
    });
    return completedFilesCount;
}
