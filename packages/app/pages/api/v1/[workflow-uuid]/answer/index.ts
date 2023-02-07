import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";

const answersAPI = new NextExpress();

answersAPI.get(async (req, res) => {

    // const workflowUUID = req.query["workflow-uuid"] as string;

    const taskAssignmentUUID = req.query["task-assignment-uuid"] as string;

    const answers = await db.$queryRaw`
        SELECT task_answer.*, question.name as question_name, question.text as question_text FROM task_answer
        INNER JOIN task_assignment ON task_assignment.id = task_answer.task_assignment_id
                    AND task_assignment.uuid = ${taskAssignmentUUID}
        INNER JOIN question ON question.id = task_answer.question_id
    `;

    res.status(200).json(answers);

});

export default answersAPI.handler;