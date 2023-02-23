import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";
import assertUp from "@/helpers/node/assert/assertUp";
import {task_status} from "@prisma/client";


const answersAPI = new NextExpress();

answersAPI.get(async (req, res) => {

    const workflowUUID = req.query["workflow-uuid"] as string;

    // const taskAssignment = await db.task_assignment.findMany({
    //     where: {
    //         task: {
    //             workflow: {
    //                 uuid: workflowUUID
    //             }
    //         },
    //         status: task_status.in_progress
    //     },
    //     include: {
    //         task_answers: {
    //             include: {
    //                 question: true
    //             }
    //         },
    //         workflow_file: true,
    //         assignee: true
    //     }
    // });

    const taskAssignmentResponses = await db.workflow_file.findMany({
        where: {
            workflow: {
                uuid: workflowUUID
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
                }
            }
        }
    })

    res.status(200).json(taskAssignmentResponses);

});

export default answersAPI.handler;