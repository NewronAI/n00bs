INSERT INTO workflow_file (uuid, file_name, file, file_type, workflow_id, file_duration, district, state, vendor, metadata, parent_id, "createdAt", "updatedAt")
    (SELECT gen_random_uuid () as uuid, cwf.file_name, cwf.file,cwf.file_type,2 as workflow_id, cwf.file_duration, cwf.district,  cwf.state, cwf.vendor, cwf.metadata, cwf.id::int as parent_id, CURRENT_TIMESTAMP as createdAt, CURRENT_TIMESTAMP as updatedAt
        FROM (SELECT l.id as id, COUNT(l.is_expected) as accepted_count FROM
            (SELECT p.wf_id as id ,p.q_id,p.mode_answer,q.expected_answer,
                CASE WHEN (q.expected_answer IS NULL OR q.expected_answer = '' OR (LOWER(p.mode_answer) = LOWER(q.expected_answer))) then true else false END as is_expected FROM
                    (SELECT wf.id as wf_id,t.question_id as q_id, mode() WITHIN GROUP ( ORDER BY t.answer ) AS mode_answer FROM workflow_file wf
                        INNER JOIN task_assignment ta on ta.task_id = 1 AND
                                  (ta.status = 'accepted' OR ta.status = 'rejected') AND
                                  wf.id = ta.workflow_file_id
                    INNER JOIN task_answer t on ta.id = t.task_assignment_id
            GROUP BY wf.id, t.question_id) p
            INNER JOIN question q on p.q_id = q.id) l
    GROUP BY l.id, l.is_expected HAVING l.is_expected = true) c
INNER JOIN workflow_file cwf on c.id = cwf.id);