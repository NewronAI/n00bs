import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";
import assertUp from "@/helpers/node/assert/assertUp";

const getDeficitTasksApi = new NextExpress();

getDeficitTasksApi.get(async (req, res) => {
    const fileUUID = req.query.fileUUID as string;
    const workflowUUID = req.query["workflow-uuid"] as string;

    console.log(fileUUID, workflowUUID);

    //As per Srikant and Team, One workflow can have only One task, so only returning the task in the workflow
    // const tasks = await db.$queryRaw`SELECT task.uuid, task.name, task.min_assignments, COALESCE(tc.task_count, 0) as assignments,
    //                                        task."createdAt", task."updatedAt"
    //                                     as count FROM task
    //                                     LEFT JOIN
    //                                     (SELECT task_definition_id,count(task_definition_id)::INT as task_count FROM workflow_file
    //                                     INNER JOIN task_assignment ta ON workflow_file.id = ta.workflow_file_id
    //                                     AND workflow_file.uuid = ${fileUUID}
    //                                     INNER JOIN workflow w on workflow_file.workflow_id = w.id
    //                                     AND w.uuid = ${workflowUUID}
    //                                     GROUP BY workflow_file.id,task_definition_id) tc
    //                                 ON tc.task_definition_id = task.id
    //                                 WHERE task.status = 'active' AND task.min_assignments > COALESCE(tc.task_count, 0)
    //                                 ORDER BY task.id`;

    const numOfAssignments = await db.task_assignment.count({
        where: {
            workflow_file: {
                workflow: {
                    uuid: workflowUUID
                },
                uuid: fileUUID
            }
        }
    });

    const tasks = await db.task.findFirst({
            where: {
                workflow: {
                    uuid: workflowUUID
                }
            }
        }
    );

    assertUp(tasks, {
        status: 404,
        message: "Task not found"
    });

    if(tasks.min_assignments < numOfAssignments) {
        res.status(200).json([]);
        return;
    }

    res.status(200).json(tasks);

});

export default getDeficitTasksApi.handler;