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

    // accepted: 'accepted',
    const itemCount = await db.workflow_file.count({
        where: {
            workflow: {
                uuid: workflowUUID
            },
            task_assignments: {
                some: {
                    status: task_status.accepted,
                }
            }
        },
    });

    logger.debug(`Total task assignment : ${itemCount}`)

    const batchCount = 10000;

    const itemFetchPromises = [];

    for (let i = 0; i < Math.ceil(itemCount / batchCount); i++) {

        itemFetchPromises.push(db.workflow_file.findMany({
            where: {
                workflow: {
                    uuid: workflowUUID
                },
                task_assignments: {
                    some: {
                        status: task_status.accepted,
                    }
                }
            },
            include: {
                task_assignments: {
                    include: {
                        task_answers: {
                            include: {
                                question: true
                            }
                        },
                        assignee: true
                    },
                    where: {
                        status: task_status.accepted
                    }
                }
            },
            skip: i * batchCount,
            take: batchCount
        }));
    }

    const taskAssignmentAccepted = (await Promise.all(itemFetchPromises)).flat();

    logger.debug(`Accepted task assignment : ${taskAssignmentAccepted.length}`)

    //accepted
    const acceptedTaskAssignmentResponses = taskAssignmentAccepted.map((taskAssignmentAccepte) => {
        const newTaskAssignmentAccepted = {
            ...taskAssignmentAccepte,
            task_assignments: taskAssignmentAccepte.task_assignments.map((taskAssignment) => {
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
        }
        return newTaskAssignmentAccepted;
    });

    res.status(200).json(acceptedTaskAssignmentResponses);

});

export default answersAPI.handler;