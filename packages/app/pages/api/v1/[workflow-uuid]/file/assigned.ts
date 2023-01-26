import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";
import assertUp from "@/helpers/node/assert/assertUp";

const assignedFilesAPI = new NextExpress();

assignedFilesAPI.get(async (req, res) => {

    const workflowUUID = req.query["workflow-uuid"] as string;

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

    // As per Srikant and Team, One workflow can have only One task

    // this will return the assigned task asn well as whom it has been assigned to
    const assignedFiles = await db.$queryRaw`
        SELECT workflow_file.*, count(task_assignment.task_id) as total_assignments,
               member.uuid as member_uuid, member.name as memeber_name, member.district as member_district,
               member.state as member_state, member.phone as member_phone, member.email as member_email
        FROM workflow_file
                 INNER JOIN workflow ON workflow.uuid = ${workflowUUID}
                 LEFT JOIN task_assignment ON workflow_file.id = task_assignment.workflow_file_id
                 LEFT JOIN member ON member.id = task_assignment.assignee_id
        GROUP BY workflow_file.id, task_assignment.task_id, member.id
        HAVING COUNT(task_assignment.task_id) >= (SELECT task.min_assignments FROM task
                                                                                       INNER JOIN workflow ON workflow.uuid = ${workflowUUID}
            AND task.workflow_id = workflow.id LIMIT 1)
        ORDER BY workflow_file.id, task_assignment.task_id;`;

    res.status(200).json(assignedFiles);


});


export default assignedFilesAPI.handler;