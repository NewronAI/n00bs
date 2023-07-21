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

    const logger = getLogger(`/api/v1/${workflowUUID}/answer`);


    const taskAssignmentResponses = await db.workflow_file.findMany({
        where: {
            workflow: {
                uuid: workflowUUID
            },
            task_assignments: {
                some: {
                    status: task_status.in_progress,
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
                    status: task_status.in_progress
                }
            }
        }
    });

    logger.debug(`taskAssignmentResponses : ${taskAssignmentResponses.length}`);

    const processedTaskAssignmentResponses = taskAssignmentResponses.map((taskAssignmentResponse) => {
        const newTaskAssignmentResponse = {
            ...taskAssignmentResponse,
            task_assignments: taskAssignmentResponse.task_assignments.map((taskAssignment) => {
                const processedTaskAnswer = new Map<string, string>();

                taskAssignment.task_answers.forEach((taskAnswer) => {
                    processedTaskAnswer.set(taskAnswer.question.uuid, taskAnswer.answer);
                });

                return {
                    ...taskAssignment,
                    task_answers: Object.fromEntries(processedTaskAnswer)
                }
            })
        }
        return newTaskAssignmentResponse;
    });

    logger.debug(`processTaskAssignmentResponses : ${processedTaskAssignmentResponses.length}`);

    res.status(200).json(processedTaskAssignmentResponses);
    return;

});

export default answersAPI.handler;