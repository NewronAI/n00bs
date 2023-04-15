import NextExpress from "@/helpers/node/NextExpress";
import { db } from "@/helpers/node/db";
import { task_status } from "@prisma/client";
import getLogger from "@/helpers/node/getLogger";


const answersAPI = new NextExpress();

answersAPI.get(async (req, res) => {

    const workflowUUID = req.query["workflow-uuid"] as string;

    const logger = getLogger(`/api/v1/${workflowUUID}/answer/answer_rejected`);

    const taskAssignmentRejected = await db.workflow_file.findMany({
        where: {
            workflow: {
                uuid: workflowUUID
            },
            task_assignments: {
                some: {
                    status: task_status.rejected,
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
                    status: task_status.rejected
                }
            }
        }
    });

    logger.debug(`taskAssignmentRejected : ${taskAssignmentRejected.length}`);

    //rejected
    const rejectedTaskAssignmentResponses = taskAssignmentRejected.map((taskAssignmentRejecte) => {
        const newTaskAssignmentRejected = {
            ...taskAssignmentRejecte,
            task_assignments: taskAssignmentRejecte.task_assignments.map((taskAssignment) => {
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
        return newTaskAssignmentRejected;
    });

    res.status(200).json(rejectedTaskAssignmentResponses);

    //accepted

});

export default answersAPI.handler;