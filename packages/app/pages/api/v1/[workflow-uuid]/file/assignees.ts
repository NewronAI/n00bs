import NextExpress from "@/helpers/node/NextExpress";
import assertUp from "@/helpers/node/assert/assertUp";
import {db} from "@/helpers/node/db";

const fileAssigneeApi = new NextExpress();


fileAssigneeApi.get(async (req, res) => {

    const workflowUUID = req.query["workflow-uuid"] as string;
    const fileUUID = req.query["file-uuid"] as string;

    assertUp(workflowUUID, {
        status: 400,
        message: "workflow-uuid is required"
    })

    assertUp(fileUUID, {
        status: 400,
        message: "file-uuid is required"
    });

    const assignees = await db.$queryRaw`SELECT member.* FROM member
      INNER JOIN task_assignment ON member.id = task_assignment.assignee_id
      INNER JOIN workflow_file ON task_assignment.workflow_file_id = workflow_file.id
        AND workflow_file.uuid = ${fileUUID}
        `;

    res.status(200).json(assignees);

})

export default fileAssigneeApi.handler;