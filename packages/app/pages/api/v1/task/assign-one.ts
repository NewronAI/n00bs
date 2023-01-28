import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";
import assertUp from "@/helpers/node/assert/assertUp";

const assignOneTaskApi = new NextExpress();


assignOneTaskApi.post(async (req, res) => {

    // const workflowUUID = req.query["workflow-uuid"] as string;
    // not required rn later can be used for verification

    const taskUUID = req.query["task-uuid"] as string;
    const assigneeUUID = req.query["assignee-uuid"] as string;
    const workflowFileUUID = req.query["workflow-file-uuid"] as string;

    assertUp(taskUUID, {
        status: 400,
        message: "workflow-uuid: Param is required. Should contain the uuid of the task"
    });

    assertUp(assigneeUUID, {
        status: 400,
        message: "assignee-uuid: Param is required. Should contain the uuid of the assignee"
    });

    assertUp(workflowFileUUID, {
        status: 400,
        message: "workflow-file-uuid: Param is required. Should contain the uuid of the workflow file"
    });


    const task = await db.task.findFirst({
        where: {
            uuid: taskUUID
        }
    });

    assertUp(task, {
        status: 404,
        message: "Task not found"
    });

    const assignee = await db.member.findFirst({
        where: {
            uuid: assigneeUUID
        }
    });

    assertUp(assignee, {
        status: 404,
        message: "Assignee not found"
    });

    const workflowFile = await db.workflow_file.findFirst({
        where: {
            uuid: workflowFileUUID
        }
    });

    assertUp(workflowFile, {
        status: 404,
        message: "Workflow file not found"
    });



    const status = await db.task_assignment.create({
        data: {
            name: "New Task",
            task_id: task.id,
            assignee_id: assignee.id,
            workflow_file_id: workflowFile.id
        }
    });

    res.status(200).json(status);

});

export default assignOneTaskApi.handler;