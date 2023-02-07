import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";
import assertUp from "@/helpers/node/assert/assertUp";
import getPublicWorkflowAPISecret from "@/helpers/getPublicWorkflowAPISecret";
import {obj_status, task_status} from "@prisma/client";

const getAllAssignmentsApi = new NextExpress();

getAllAssignmentsApi.get(async (req, res) => {

    const workflowUUID = req.query["workflow-uuid"] as string;

    assertUp(workflowUUID, {
        status: 400,
        message: "workflow-uuid: Param is required. Should contain the uuid of the workflow"
    });

    const secret = req.query.secret as string;

    assertUp(secret, {
        status: 400,
        message: "secret: Query Param is required. Should contain the secret of the workflow"
    });

    const calculatedSecret = await getPublicWorkflowAPISecret(workflowUUID);
    console.log("Secret: ", secret, calculatedSecret);

    assertUp(calculatedSecret === secret, {
        status: 400,
        message: "secret: The secret is not valid"
    })

    const task = await db.task.findFirst({
        where: {
            workflow : {
                uuid: workflowUUID
            },
            status: obj_status.active
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
        message: `task: task not found for workflow with uuid ${workflowUUID}`
    });

    const taskAssignments = await db.task_assignment.findMany({
        where: {
            task_id: task.id,
            status: task_status.pending
        },
        include: {
            assignee: true,
            workflow_file: true
        }
    });

    const dataToSend = {
        task: {
            uuid: task.uuid,
            title: task.name,
            createdAt: task.createdAt,
            district: task.district,
            state: task.state,
            minReqAssignmentsPerFile: task.min_assignments,
        },
        task_assignments: taskAssignments.map((taskAssignment) => {
            return {
                task_assignment_uuid: taskAssignment.uuid,
                task_assignment_createdAt: taskAssignment.createdAt,
                workflow_file: taskAssignment.workflow_file,
                assignee: taskAssignment.assignee,
            }
        }),
        questions: task.task_questions.map((taskQuestion) => taskQuestion.questions),
    }

    res.json(dataToSend);

});

export default getAllAssignmentsApi.handler;