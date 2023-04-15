import NextExpress from "@/helpers/node/NextExpress";
import { db } from "@/helpers/node/db";
import assertUp from "@/helpers/node/assert/assertUp";
import { task_status } from "@prisma/client";
import getLogger from "@/helpers/node/getLogger";


const answersAPI = new NextExpress();

answersAPI.get(async (req, res) => {

    const workflowUUID = req.query["workflow-uuid"] as string;
    const logger = getLogger(`/api/v1/${workflowUUID}/answer/answer_accepted`);

    // accepted: 'accepted',
    const taskAssignmentAccepted = await db.workflow_file.findMany({
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
        }
    });

    logger.debug(`Accepted task assignment : ${taskAssignmentAccepted.length}`)

    //accepted
    const acceptedTaskAssignmentResponses = taskAssignmentAccepted.map((taskAssignmentAccepte) => {
        const newTaskAssignmentAccepted = {
            ...taskAssignmentAccepte,
            task_assignments: taskAssignmentAccepte.task_assignments.map((taskAssignment) => {
                const processedTaskAnswer = new Map<string, string>();

                taskAssignment.task_answers.forEach((taskAnswer) => {
                    processedTaskAnswer.set(taskAnswer.question.uuid, taskAnswer.answer);
                });

                console.log(processedTaskAnswer);

                return {
                    ...taskAssignment,
                    task_answers: Object.fromEntries(processedTaskAnswer)
                }
            })
        }
        return newTaskAssignmentAccepted;
    });

    res.status(200).json(acceptedTaskAssignmentResponses);

});

export default answersAPI.handler;