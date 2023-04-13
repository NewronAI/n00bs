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
        WITH
            wf_id AS (
                SELECT id FROM workflow WHERE uuid = ${workflowUUID}
            ),
            reqdcount as
                (SELECT t.min_assignments FROM task t INNER JOIN workflow w ON t.workflow_id = w.id WHERE w.id = (SELECT id FROM wf_id)),
            assignments AS (SELECT ta.workflow_file_id as file_id, count(assignee_id) as ass_count FROM task_assignment ta
                                                                                                            INNER JOIN workflow_file wf ON ta.workflow_file_id = wf.id WHERE wf.workflow_id = (SELECT id FROM wf_id) GROUP BY ta.workflow_file_id),
            assigned_files AS (
                SELECT file_id FROM assignments WHERE ass_count >= (SELECT * FROM reqdcount))
        SELECT * FROM workflow_file wf INNER JOIN assigned_files ON wf.id = assigned_files.file_id;
        `;

    res.status(200).json(assignedFiles);


});


export default assignedFilesAPI.handler;