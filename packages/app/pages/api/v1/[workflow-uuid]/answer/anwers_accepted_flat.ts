import NextExpress from "@/helpers/node/NextExpress";
import { db } from "@/helpers/node/db";
import assertUp from "@/helpers/node/assert/assertUp";
import { task_status } from "@prisma/client";
import getLogger from "@/helpers/node/getLogger";

export const config = {
    api: {
        responseLimit: false,
    },
}

const answersAPI = new NextExpress();

answersAPI.get(async (req, res) => {

    const workflowUUID = req.query["workflow-uuid"] as string;
    const logger = getLogger(`/api/v1/${workflowUUID}/answer/answer_accepted`);
    logger.debug("WORKFLOE id", workflowUUID);
    // accepted: 'accepted',
    const itemCount = await db.task_assignment.count({
        where: {
            workflow_file: {
                workflow: {
                    uuid: workflowUUID,
                }
            },
            status: task_status.accepted,
        },
    });

    logger.debug(`Total task assignment : ${itemCount}`)

    const batchCount = 10000;

    const itemFetchPromises = [];

    for (let i = 0; i < Math.ceil(itemCount / batchCount); i++) {

        itemFetchPromises.push(db.task_assignment.findMany({
            where: {
                workflow_file: {
                    workflow: {
                        uuid: workflowUUID,
                    }
                },
                status: task_status.accepted,
            },
            include: {
                assignee: {
                    select: {
                        name: true,
                        phone: true,
                    },
                },
                workflow_file: {
                    select: {
                        file_name: true,
                        file_type: true,
                        file: true,
                        vendor: true,
                        state: true,
                        district: true,
                        createdAt: true,
                    },
                },
                task_answers: {
                    select: {
                        createdAt: true,
                        answer: true,
                        question: true,
                    }
                }
            },
            skip: i * batchCount,
            take: batchCount
        }));
    }

    const taskAssignmentAccepted = (await Promise.all(itemFetchPromises)).flat();

    logger.debug(`Accepted task assignment : ${taskAssignmentAccepted.length}`)

    // accepted
    // const acceptedTaskAssignmentResponses = taskAssignmentAccepted.map((taskAssignmentAccepte) => {
    //     const newTaskAssignmentAccepted = {
    //         ...taskAssignmentAccepte,
    //         task_assignments: taskAssignmentAccepte.task_assignments.map((taskAssignment) => {
    //             const processedTaskAnswer = new Map<string, string>();
    //             let answerAt;
    //             taskAssignment.task_answers.forEach((taskAnswer) => {
    //                 processedTaskAnswer.set(taskAnswer.question.uuid, taskAnswer.answer);
    //                 answerAt = taskAnswer.createdAt;
    //             });

    //             return {
    //                 ...taskAssignment,
    //                 task_answers: Object.fromEntries(processedTaskAnswer),
    //                 answerAt
    //             }
    //         })
    //     }
    //     return newTaskAssignmentAccepted;
    // });

    const acceptedTaskAssignmentResponses = taskAssignmentAccepted.map((taskAssignment) => {
        const processedTaskAnswer = new Map<string, string>();
        let answerAt;
        taskAssignment.task_answers.forEach((taskAnswer) => {
            processedTaskAnswer.set(taskAnswer.question.uuid, taskAnswer.answer);
            answerAt = taskAnswer.createdAt;
        });

        return {
            ...taskAssignment,
            task_answers: Object.fromEntries(processedTaskAnswer),
            answerAt
        }
    })

    logger.debug("returning reponse of size : " + acceptedTaskAssignmentResponses.length);
    res.status(200).json(acceptedTaskAssignmentResponses);

});

export default answersAPI.handler;