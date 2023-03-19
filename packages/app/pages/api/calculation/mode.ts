import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";

const modeTs = new NextExpress();

modeTs.get(async (req, res) => {


    let x = await db.$queryRaw`WITH mode_answer AS (SELECT wf.id as wf_id,t.question_id as q_id, mode() WITHIN GROUP ( ORDER BY t.answer ) AS mode_answer FROM workflow_file wf
INNER JOIN task_assignment ta on wf.calculated = false AND ta.task_id = 1 AND
(ta.status = 'accepted' OR ta.status = 'rejected') AND
wf.id = ta.workflow_file_id
INNER JOIN task_answer t on ta.id = t.task_assignment_id
GROUP BY wf.id, t.question_id),
    wf_answer AS (SELECT p.wf_id as id ,p.q_id,p.mode_answer,q.expected_answer,
CASE WHEN (q.expected_answer IS NULL OR q.expected_answer = '' OR (LOWER(p.mode_answer) = LOWER(q.expected_answer))) then true else false END as is_expected FROM mode_answer p
INNER JOIN question q on p.q_id = q.id),
    wf_count AS (SELECT l.id as id, COUNT(l.is_expected) as accepted_count FROM wf_answer l
GROUP BY l.id, l.is_expected HAVING l.is_expected = true),
    question_count AS ((SELECT COUNT(*) as count FROM task_question tq INNER JOIN question q ON tq.task_id = 1 AND q.expected_answer IS NOT NULL AND tq.question_id = q.id)),
    wf_filtered_files AS (SELECT id FROM wf_count WHERE accepted_count >= (SELECT count FROM question_count)),
    update_tasks AS (UPDATE workflow_file wf SET calculated = true WHERE id IN (SELECT id FROM wf_filtered_files) RETURNING *),
    wf_file AS (SELECT c.id, cwf.file_name, cwf.file,cwf.file_type,2 as workflow_id, cwf.file_duration, cwf.district,  cwf.state, cwf.vendor, cwf.metadata, cwf.id::int as parent_id, CURRENT_TIMESTAMP as createdAt, CURRENT_TIMESTAMP as updatedAt
FROM wf_filtered_files c
INNER JOIN workflow_file cwf on c.id = cwf.id)
INSERT INTO workflow_file (file_name, file, uuid, file_type, workflow_id, file_duration, district, state, vendor, metadata, parent_id, "createdAt", "updatedAt")
SELECT file_name, file, gen_random_uuid(), file_type, workflow_id, file_duration, district, state, vendor, metadata, id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM wf_file`;

    res.status(200).json(x);

});


export default modeTs.handler;