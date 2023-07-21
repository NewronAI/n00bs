import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";
import assertUp from "@/helpers/node/assert/assertUp";
import getPublicWorkflowAPISecret from "@/helpers/getPublicWorkflowAPISecret";
import {obj_status, task_status} from "@prisma/client";
import getLogger from "@/helpers/node/getLogger";

export const config = {
    api: {
      responseLimit: false,
    },
  }

const getAllAssignmentsApi = new NextExpress();

getAllAssignmentsApi.get(async (req, res) => {

    const workflowUUID = req.query["workflow-uuid"] as string;

    const logger = getLogger(`/api/v1/${workflowUUID}/public/assignment/get-all`);

    assertUp(workflowUUID, {
        status: 400,
        message: "workflow-uuid: Param is required. Should contain the uuid of the workflow"
    });

    const secret = req.query.secret as string;

    logger.debug(`secret : ${secret}`);

    assertUp(secret, {
        status: 400,
        message: "secret: Query Param is required. Should contain the secret of the workflow"
    });

    const workflow = await db.workflow.findFirstOrThrow({
        where: {
            uuid: workflowUUID
        }
    });

    logger.debug(`workflow : ${workflow.name}`);

    const calculatedSecret = await getPublicWorkflowAPISecret(workflowUUID);

    logger.debug(`secret : ${secret} , calculatedSecret : ${calculatedSecret}`);

    assertUp(calculatedSecret === secret, {
        status: 400,
        message: "secret: The secret is not valid"
    })

    const task = await db.task.findFirstOrThrow({
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
    

    logger.debug(`taskName : ${task.name}`);

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

    logger.debug(`taskAssignments len: ${taskAssignments.length}`);

    const dataToSend = {
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
        task_assignments: taskAssignments.map((taskAssignment) => {
            return {
                task_assignment_uuid: taskAssignment.uuid,
                task_assignment_createdAt: taskAssignment.createdAt,
                workflow_file: taskAssignment.workflow_file,
                assignee: taskAssignment.assignee,
            }
        }),
    }

    res.json(dataToSend);

});

export default getAllAssignmentsApi.handler;