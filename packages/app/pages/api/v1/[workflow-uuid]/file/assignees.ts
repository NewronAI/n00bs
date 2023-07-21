import NextExpress from "@/helpers/node/NextExpress";
import assertUp from "@/helpers/node/assert/assertUp";
import {db} from "@/helpers/node/db";
import getLogger from "@/helpers/node/getLogger";

export const config = {
  api: {
    responseLimit: false,
  },
}

const fileAssigneeApi = new NextExpress();

fileAssigneeApi.get(async (req, res) => {

    const workflowUUID = req.query["workflow-uuid"] as string;
    const fileUUID = req.query["file-uuid"] as string;

    const logger = getLogger(`/api/v1/${workflowUUID}/file/assignees`);

    const assignees = await db.$queryRaw`SELECT member.* FROM member
      INNER JOIN task_assignment ON member.id = task_assignment.assignee_id
      INNER JOIN workflow_file ON task_assignment.workflow_file_id = workflow_file.id
        AND workflow_file.uuid = ${fileUUID}
        `;

    logger.debug(`assignees : ${assignees && typeof assignees === 'object' && JSON.stringify(assignees)}`);

    res.status(200).json(assignees);

})

export default fileAssigneeApi.handler;