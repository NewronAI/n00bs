import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";
import assertUp from "@/helpers/node/assert/assertUp";

const assignTaskApi = new NextExpress();


assignTaskApi.post(async (req, res) => {

    // const workflowUUID = req.query["workflow-uuid"] as string;
    // not required rn later can be used for verification

    const workflowUUID = req.query["workflow-uuid"] as string;
    // const taskUUID = req.query["task-uuid"] as string;
    const assigneeUUID = req.query["assignee-uuid"] as string;
    const workflowFileUUID = req.query["workflow-file-uuid"] as string;

    assertUp(workflowUUID, {
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
            workflow :{
                uuid: workflowUUID
            }
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



assignTaskApi.put(async (req, res) => {
    // API to update the task assignment and reassign the task to another assignee


    const task_assignmentUUID = req.query["task-assignment-uuid"] as string;
    const assigneeUUID = req.query["assignee-uuid"] as string;

    assertUp(task_assignmentUUID, {
        status: 400,
        message: "Task Assignment UUID: Param is required. Should contain the uuid of the task assignment"
    });

    assertUp(assigneeUUID, {
        status: 400,
        message: "Assignee UUID: Param is required. Should contain the uuid of the assignee"
    });

    const task_assignment = await db.task_assignment.findFirst({
        where: {
            uuid: task_assignmentUUID
        }
    });

    assertUp(task_assignment, {
        status: 404,
        message: "Task assignment not found"
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

    const status = await db.task_assignment.update({
        where: {
            uuid: task_assignmentUUID
        },
        data: {
            assignee_id: assignee.id
        }
    });

    res.status(200).json(status);

});

assignTaskApi.delete(async (req, res) => {
   // API to delete the task assignment

    const task_assignmentUUID = req.query["task-assignment-uuid"] as string;

    assertUp(task_assignmentUUID, {
        status: 400,
        message: "Task Assignment UUID: Param is required. Should contain the uuid of the task assignment"
    });


    const task_assignment = await db.task_assignment.findFirst({
        where: {
            uuid: task_assignmentUUID
        }
    });

    assertUp(task_assignment, {
        status: 404,
        message: "Task assignment not found"
    });

    const status = await db.task_assignment.delete({
        where: {
            uuid: task_assignmentUUID
        }
    });

    res.status(200).json(status);

})

export default assignTaskApi.handler;