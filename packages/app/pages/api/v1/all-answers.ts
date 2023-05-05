import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";

const allAnswersApi = new NextExpress();

allAnswersApi.get(async (req,res) => {

    const data = await db.$queryRaw`SELECT task_answer.question_id as question_id, task_answer.answer as answer,wf.*,m.* FROM task_answer INNER JOIN task_assignment ta on task_answer.task_assignment_id = ta.id INNER JOIN task t on ta.task_id = t.id INNER JOIN workflow_file wf on ta.workflow_file_id = wf.id INNER JOIN member m on m.id = ta.assignee_id`;

    console.log(data);

    res.json(data);

})

export default allAnswersApi.handler;