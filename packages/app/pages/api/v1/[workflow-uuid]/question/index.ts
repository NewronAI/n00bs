import NextExpress from "@/helpers/node/NextExpress";
import assertUp from "@/helpers/node/assert/assertUp";
import {db} from "@/helpers/node/db";

const questionWorkflowApi = new NextExpress();

questionWorkflowApi.get(async (req, res) => {
    //     get list of questions in the workflow

    const workflowUUID = req.query["workflow-uuid"] as string;

    assertUp(workflowUUID, {
        status: 400,
        message: "workflow-uuid not provided"
    });

    const task = await db.task.findFirst({
        where: {
            workflow: {
                uuid: workflowUUID
            }
        }
    });

    assertUp(task, {
        status: 404,
        message: "Workflow not found"
    });

    const questions = await db.$queryRaw`
        SELECT question.* FROM question
        INNER JOIN task_question ON task_question.question_id = question.id
        AND task_question.task_id = ${task.id}
        ORDER BY question.order ASC
    `

    res.status(200).json(questions);

})


export default questionWorkflowApi.handler;
