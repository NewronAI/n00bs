import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";

const deliveryAPI = new NextExpress();

deliveryAPI.get(async (req, res) => {

    const data = await db.$queryRaw`WITH mode_answer3q AS (SELECT wf.id as wf_id,t.question_id as q_id, mode() WITHIN GROUP ( ORDER BY t.answer ) AS mode_answer FROM workflow_file wf
                                                                                                                                INNER JOIN task_assignment ta on ta.task_id = 1  AND
                                                                                                                                                                 wf.id = ta.workflow_file_id
                                                                                                                                INNER JOIN task_answer t on ta.id = t.task_assignment_id
                 GROUP BY wf.id, t.question_id ORDER BY t.question_id),
 wf_answer3q AS (SELECT p.wf_id as id ,p.q_id,p.mode_answer,q.expected_answer,
                      CASE WHEN (q.expected_answer IS NULL OR q.expected_answer = '' OR (LOWER(p.mode_answer) = LOWER(q.expected_answer))) then true else false END as is_expected FROM mode_answer3q p
                                                                                                                                                                                            INNER JOIN question q on p.q_id = q.id),
mode_answer5q AS (SELECT wf.id as wf_id,t.question_id as q_id, mode() WITHIN GROUP ( ORDER BY t.answer ) AS mode_answer FROM workflow_file wf
                                                                                                                                  INNER JOIN task_assignment ta on ta.task_id = 2  AND
                                                                                                                                                                   wf.id = ta.workflow_file_id
                                                                                                                                  INNER JOIN task_answer t on ta.id = t.task_assignment_id
                   GROUP BY wf.id, t.question_id ORDER BY t.question_id),
wf_answer5q AS (SELECT wf.parent_id as id ,p.q_id,p.mode_answer,q.expected_answer,
CASE WHEN (q.expected_answer IS NULL OR q.expected_answer = '' OR (LOWER(p.mode_answer) = LOWER(q.expected_answer))) then true else false END as is_expected FROM mode_answer5q p
INNER JOIN question q on p.q_id = q.id INNER JOIN  workflow_file wf on wf.id = p.wf_id),
answers3q AS (SELECT id, array_agg(mode_answer) as wf_3q FROM wf_answer3q GROUP BY id),
answers5q AS (SELECT id, array_agg(mode_answer) as wf_5q FROM wf_answer5q GROUP BY id),
combined AS (
SELECT answers3q.id as id, answers3q.wf_3q as wf_3q , answers5q.wf_5q as wf_5q FROM answers3q INNER JOIN answers5q ON answers5q.id = answers3q.id)
SELECT * FROM workflow_file INNER JOIN combined on workflow_file.id = combined.id;`;

    res.json(data);

});

export default deliveryAPI.handler;