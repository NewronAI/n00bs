import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";
import assertUp from "@/helpers/node/assert/assertUp";
import {Prisma} from "@prisma/client";

const unassignedFilesApi = new NextExpress();

unassignedFilesApi.get(async (req, res) => {

    const workflowUUID = req.query["workflow-uuid"] as string;

    assertUp(workflowUUID, {
        status: 400,
        message: "Workflow UUID is required"
    });

    const workflow = await db.workflow.findFirst({
        where: {
            uuid: workflowUUID
        },
        include: {
            tasks: true
        }
    });

    assertUp(workflow, {
        status: 404,
        message: "Workflow not found"
    });

    const workflowId = workflow.id;
    console.log(workflowUUID,workflowId);

    // As per Srikant and Team, One workflow can have only One task
    const unassignedFiles = await db.$queryRaw`SELECT workflow_file.*, count(task_assignment.task_id) as assignment_count FROM workflow_file
            INNER JOIN workflow ON workflow.id = ${workflowId}
            LEFT JOIN task_assignment ON workflow_file.id = task_assignment.workflow_file_id
        GROUP BY workflow_file.id, task_assignment.task_id
        HAVING COUNT(task_assignment.task_id) < (SELECT task.min_assignments FROM task
            INNER JOIN workflow ON workflow.id = ${workflowId}
            AND task.workflow_id = workflow.id ORDER BY task.id LIMIT 1)
        ORDER BY workflow_file.id, task_assignment.task_id;`;



    res.status(200).json(unassignedFiles);

});

export default unassignedFilesApi.handler;