import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";
import assertUp from "@/helpers/node/assert/assertUp";
import webhookHandler from "@/helpers/node/webhookHandler";
import {events} from "@prisma/client";
import getLogger from "@/helpers/node/getLogger";
// import getLogger from "@/helpers/node/getLogger";

export const config = {
    api: {
      responseLimit: false,
    },
  }

const assignTaskApi = new NextExpress();


// const logger = getLogger('assignTaskApi');

assignTaskApi.post(async (req, res) => {

    // const workflowUUID = req.query["workflow-uuid"] as string;
    // not required rn later can be used for verification

    const workflowUUID = req.query["workflow-uuid"] as string;
    const assigneeUUID = req.body["assignee-uuid"] as string;
    const workflowFileUUIDs = req.body["workflow-file-uuids"] as string[];

    const logger = getLogger(`/api/v1/${workflowUUID}/task/reassign`);

    assertUp(workflowUUID, {
        status: 400,
        message: "workflow-uuid: Param is required. Should contain the uuid of the task"
    });

    assertUp(assigneeUUID, {
        status: 400,
        message: "assignee-uuid: Param is required. Should contain the uuid of the assignee"
    });

    assertUp(workflowFileUUIDs.length, {
        status: 400,
        message: "workflow-file-uuids: Param is required. Should contain the list of uuid of the workflow file(s)"
    });


    const task = await db.task.findFirst({
        where: {
            workflow :{
                uuid: workflowUUID
            }
        },
        include: {
            task_questions: {
                include: {
                    questions: true
                }
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

    const workflowFiles = await db.workflow_file.findMany({
        where: {
            uuid: {
                in: workflowFileUUIDs
            }
        },
        select: {
            id: true,
            uuid: true
        }
    });

    assertUp(workflowFiles.length === workflowFileUUIDs.length, {
        status: 404,
        message: "Some workflow files not found"
    });

    const workflowFileIds : number[] = workflowFiles.map((wf) => wf.id);

    // const workflowFilesMap = new Map<string, number>(workflowFiles.map((wf) => [wf.uuid, wf.id]));

    // don't make duplicate assignment for same task, assignee and workflow file

    const existingAssignments = await db.task_assignment.findMany({
        where: {
            task_id: task.id,
            assignee_id: assignee.id,
            workflow_file_id: {
                in : workflowFileIds
            }
        }
    });

    const existingAssignmentsMap = new Map<string, number>(existingAssignments.map((ea) => [ea.workflow_file_id.toString(), ea.id]));

    const newAssignments = workflowFileIds.filter((wfId) => !existingAssignmentsMap.has(wfId.toString()));

    const newAssignmentsData = newAssignments.map((wfId) => ({
        task_id: task.id,
        assignee_id: assignee.id,
        workflow_file_id: wfId,
        name: `Task Assignment for ${assignee.name} for ${task.name}`
    }));


    const newAssignmentsResult = await db.$transaction(
        newAssignmentsData.map((assignmentData) => db.task_assignment.create({
            data: assignmentData
        }))
    );

    const newAssignmentIds = newAssignmentsResult.map(ass => ass.id);

    const workflow = await db.workflow.findFirst({
        where: {
            uuid: workflowUUID
        }
    });

    assertUp(workflow, {
        status: 404,
        message: "Task created but workflow not found, this should not happen"
    });


    const taskAssignments = await db.task_assignment.findMany({
        where: {
            task_id: task.id,
            id: {
                in: newAssignmentIds
            }
        },
        include: {
            assignee: true,
            workflow_file: true
        }
    });

    assertUp(taskAssignments.length, {
        status: 404,
        message: "Task created but task assignment not found, this should not happen"
    });

     webhookHandler(events.task_assignment_created, workflowUUID, {
         workflow,
         task: {
             uuid: task.uuid,
             title: task.name,
             createdAt: task.createdAt,
             district: task.district,
             state: task.state,
             minReqAssignmentsPerFile: task.min_assignments,
         },
         questions: task.task_questions.map((taskQuestion) => taskQuestion.questions),
        "task_assignments":  taskAssignments

     }).then(() => {
        logger.debug("Webhook triggered");
    });

    res.status(200).json(newAssignmentsResult);

});



assignTaskApi.put(async (req, res) => {
    // API to update the task assignment and reassign the task to another assignee

    const task_assignmentUUID = req.query["task-assignment-uuid"] as string;
    const assigneeUUID = req.query["assignee-uuid"] as string;

    assertUp(task_assignmentUUID, {
        status: 400,
        message: "task-assignment-uuid: Param is required. Should contain the uuid of the task assignment"
    });

    assertUp(assigneeUUID, {

        status: 400,
        message: "assignee-uuid: Param is required. Should contain the uuid of the assignee"
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

    const workflowUUID = req.query["workflow-uuid"] as string;

    const workflow = await db.workflow.findFirst({
        where: {
            uuid: workflowUUID
        }
    });

    const task = await db.task.findFirstOrThrow({
        where: {
            id: task_assignment.task_id
        },
        include: {
            task_questions: {
                include: {
                    questions: true
                }
            }
        }
    });

    webhookHandler(events.task_assignment_created, workflowUUID, {
        workflow,
        task: {
            uuid: task.uuid,
            title: task.name,
            createdAt: task.createdAt,
            district: task.district,
            state: task.state,
            minReqAssignmentsPerFile: task.min_assignments,
        },
        questions: task.task_questions.map((taskQuestion) => taskQuestion.questions),
        isUpdate: true,
        "task_assignments":  [status]

    }).then(() => {
        console.log("Update Webhook triggered");
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
        },

    });

    res.status(200).json(status);

})

export default assignTaskApi.handler;