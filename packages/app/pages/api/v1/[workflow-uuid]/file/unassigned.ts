import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";
import assertUp from "@/helpers/node/assert/assertUp";

export const config = {
    api: {
      responseLimit: false,
    },
  }

const unassignedFilesApi = new NextExpress();

unassignedFilesApi.get(async (req, res) => {

    const workflowUUID = req.query["workflow-uuid"] as string;

    assertUp(workflowUUID, {
        status: 400,
        message: "Workflow UUID is required"
    });

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

    const workflowId = workflow.id;

    // As per Srikant and Team, One workflow can have only One task
    const unassignedFiles = await db.$queryRaw`WITH
                                                   wf_id AS (
                                                       SELECT id FROM workflow WHERE uuid = ${workflowUUID}
                                                   ),
                                                   reqdcount as
                                                       (SELECT t.min_assignments FROM task t INNER JOIN workflow w ON t.workflow_id = w.id WHERE w.id = (SELECT id FROM wf_id)),
                                                   assignments AS (SELECT ta.workflow_file_id as file_id, count(assignee_id) as ass_count FROM task_assignment ta
                                                                                                                                                   INNER JOIN workflow_file wf ON ta.workflow_file_id = wf.id WHERE wf.workflow_id = (SELECT id FROM wf_id) GROUP BY ta.workflow_file_id),
                                                   half_assigned_files AS (
                                                       SELECT file_id FROM assignments WHERE ass_count < (SELECT * FROM reqdcount)),
                                                   unassigned_files AS (
                                                       SELECT wf.id as file_id FROM workflow_file wf LEFT JOIN task_assignment ta ON wf.id = ta.workflow_file_id WHERE ta.id is null AND wf.workflow_id = (SELECT id FROM wf_id)
                                                   ),
                                                   all_unassingned AS (
                                                       SELECT file_id FROM half_assigned_files UNION SELECT file_id FROM unassigned_files
                                                   ), unassigned_with_count AS (SELECT au.file_id as file_id, count(ta.id) as assignment_count FROM all_unassingned au LEFT JOIN task_assignment ta ON ta.workflow_file_id = au.file_id GROUP BY file_id)
SELECT wf.*,uc.assignment_count as assignment_count FROM workflow_file wf INNER JOIN unassigned_with_count uc ON uc.file_id = wf.id;`;



    res.status(200).json(unassignedFiles);

});

export default unassignedFilesApi.handler;