import NextExpress from "@/helpers/node/NextExpress";
import assertUp from "@/helpers/node/assert/assertUp";
import {db} from "@/helpers/node/db";

const workersAPI = new NextExpress();

workersAPI.get(async (req,res) => {
    const workflowUUID = req.query["workflow-uuid"];

    assertUp(workflowUUID, {
        status: 400,
        message: "workflow-uuid: Param is required. Should contain the uuid of the workflow"
    });

    const workers = await db.$queryRaw`
        SELECT member.*, count(task_assignment.assignee_id) AS task_counts,AVG(task_assignment.review_rating) as rating  FROM member
            INNER JOIN  task_assignment ON member.id = task_assignment.assignee_id
        GROUP BY member.id, task_assignment.assignee_id
        ORDER BY task_counts DESC
    `;

    res.status(200).json(workers);
})

export default workersAPI.handler;