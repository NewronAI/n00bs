import NextExpress from "@/helpers/node/NextExpress";
import assertUp from "@/helpers/node/assert/assertUp";
import {db} from "@/helpers/node/db";
import {task_status} from "@prisma/client";
import {getSession} from "@auth0/nextjs-auth0";

const reviewApi = new NextExpress();


reviewApi.post(async (req, res) => {

    const workflowUUID = req.query["workflow-uuid"] as string;
    const taskAssignmentArray = req.body["task-assignment-uuid"] as string;

    const session = await getSession( req , res);
    const email = session?.user.email;

    assertUp(workflowUUID, {
        status: 400,
        message: "workflow-uuid: Param is required. Should contain the uuid of the workflow"
    });

    assertUp(taskAssignmentArray, {
        status: 400,
        message: "task-assignment-uuid: Body Param is required. Should contain the uuid of the task assignment"
    });

    // const taskAssignment = await db.task_assignment.findFirst({
    //     where: {
    //         uuid: taskAssignmentUUID
    //     }
    // });

    // const reviewResult = await db.task_assignment.update({
    //     where: {
    //         uuid: taskAssignmentUUID
    //     },
    //     data: {
    //         review_rating: ratingNumber,
    //         review_comments: comment,
    //         status: accepted ? task_status.accepted : task_status.rejected,
    //         reviewer: {
    //             connect: {
    //                 email: email
    //             }
    //         }
    //     }
    // });

    res.status(200).json("Success");

})


export default reviewApi.handler;