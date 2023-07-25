import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";
import assertUp from "@/helpers/node/assert/assertUp";
import webhookHandler from "@/helpers/node/webhookHandler";
import {events, task_status} from "@prisma/client";
import getLogger from "@/helpers/node/getLogger";

export const config = {
    api: {
      responseLimit: false,
    },
  }

const logger = getLogger("/task/assign");

const assignTaskApi = new NextExpress();


// const logger = getLogger('assignTaskApi');

assignTaskApi.post(async (req, res) => {

    // const workflowUUID = req.query["workflow-uuid"] as string;
    // not required rn later can be used for verification

    const workflowUUID = req.query["workflow-uuid"] as string;
    const assigneeUUID = req.body["assignee-uuid"] as string;
    const workflowFileUUIDs = req.body["workflow-file-uuids"] as string[];

    logger.debug("Assigning task to member");

    logger.debug("Workflow UUID: ", workflowUUID);
    assertUp(workflowUUID, {
        status: 400,
        message: "workflow-uuid: Param is required. Should contain the uuid of the task"
    });

    logger.debug("Assignee UUID: ", assigneeUUID);
    assertUp(assigneeUUID, {
        status: 400,
        message: "assignee-uuid: Param is required. Should contain the uuid of the assignee"
    });

    logger.debug("Workflow File UUIDs: ", workflowFileUUIDs);

    assertUp(workflowFileUUIDs.length, {
        status: 400,
        message: "workflow-file-uuids: Param is required. Should contain the list of uuid of the workflow file(s)"
    });

    logger.debug("WF uuid, assignee uuid, workflow-file-uuid length are valid ");

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

    logger.debug("Task: ", task);

    assertUp(task, {
        status: 404,
        message: "Task not found"
    });

    logger.debug("Task found");

    const assignee = await db.member.findFirst({
        where: {
            uuid: assigneeUUID
        }
    });

    logger.debug("Assignee: ", assignee);

    assertUp(assignee, {
        status: 404,
        message: "Assignee not found"
    });

    logger.debug("Assignee found");

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

    logger.debug("Workflow Files: ", workflowFiles);

    assertUp(workflowFiles.length === workflowFileUUIDs.length, {
        status: 404,
        message: "Some workflow files not found"
    });

    logger.debug("All workflow files found");

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

    logger.debug("Existing Assignments Length: ", existingAssignments.length);

    const existingAssignmentsMap = new Map<string, number>(existingAssignments.map((ea) => [ea.workflow_file_id.toString(), ea.id]));

    logger.debug("Filtering out existing assignments");
    const newAssignments = workflowFileIds.filter((wfId) => !existingAssignmentsMap.has(wfId.toString()));

    const newAssignmentsData = newAssignments.map((wfId) => ({
        task_id: task.id,
        assignee_id: assignee.id,
        workflow_file_id: wfId,
        name: `Task Assignment for ${assignee.name} for ${task.name}`
    }));

    logger.debug("New Assignments to create Length: ", newAssignments.length);

    const newAssignmentsResult = await db.$transaction(
        newAssignmentsData.map((assignmentData) => db.task_assignment.create({
            data: assignmentData
        }))
    );

    logger.debug("New Assignments created: ", newAssignmentsResult);

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

    logger.debug("Workflow found");


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

    logger.debug("ta found", taskAssignments.length);

    assertUp(taskAssignments.length, {
        status: 404,
        message: "Task created but task assignment not found, this should not happen"
    });

    logger.debug("Sending it to webhook");

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
        logger.debug(`webhook triggered`);
    });

    res.status(200).json(newAssignmentsResult);

});


assignTaskApi.put(async (req, res) => {
    // API to update the task assignment and reassign the task to another assignee

    const assigneeUUID = req.body["assignee-uuid"] as string;
    const task_assignmentUUIDs = req.body["taskAssingments-uuids"] as string[];
    console.log({task_assignmentUUIDs})

    assertUp(task_assignmentUUIDs, {
        status: 400,
        message: "task-assignment-uuids: Param is required. Should contain the uuids of the task assignments"
    });

    assertUp(assigneeUUID, {
        status: 400,
        message: "assignee-uuid: Param is required. Should contain the uuid of the assignee"
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

    const status = await db.task_assignment.updateMany({
        where: { uuid: { in: task_assignmentUUIDs } },
        data: {
          assignee_id: assignee.id,
          status: task_status.pending,
        },
      });

    console.log("Updated Task assinments",status);

    res.status(200).json(status);

});

assignTaskApi.delete(async (req, res) => {
   // API to delete the task assignment
   console.log("API called!");
   console.log("Query Parameters:", req.query);
   const task_assignmentUUIDs = req.query["task-assignment-uuids[]"] as string[];
   console.log("UUIDS", task_assignmentUUIDs);

   assertUp(task_assignmentUUIDs, {
     status: 400,
     message: "Task Assignment UUID: Param is required. Should contain the uuid of the task assignment",
   });

    try {
        const status = await db.task_assignment.deleteMany({
        where: {
            uuid: { in: task_assignmentUUIDs}
        },
    });
    res.status(200).json(status);
    } catch(e) {
        console.log(e);
        res.status(401).json({});
    }
})

export default assignTaskApi.handler;