import NextExpress from "@/helpers/node/NextExpress";
import assertUp from "@/helpers/node/assert/assertUp";
import {db} from "@/helpers/node/db";
import webhookHandler from "@/helpers/node/webhookHandler";
import {events} from "@prisma/client";

const forceReassignApi = new NextExpress();

forceReassignApi.post(async (req, res) => {

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