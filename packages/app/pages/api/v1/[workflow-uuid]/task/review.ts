import NextExpress from "@/helpers/node/NextExpress";
import assertUp from "@/helpers/node/assert/assertUp";
import {db} from "@/helpers/node/db";
import {task_status} from "@prisma/client";
import {getSession} from "@auth0/nextjs-auth0";

export const config = {
    api: {
      responseLimit: false,
    },
  }

const reviewApi = new NextExpress();


reviewApi.post(async (req, res) => {

    const workflowUUID = req.query["workflow-uuid"] as string;
    const taskAssignmentUUID = req.body["task-assignment-uuid"] as string;
    let rating = req.body.rating as string;
    const accepted = req.body.accepted as boolean;
    let comment = req.body.comment as string;

    const session = await getSession( req , res);
    const email = session?.user.email;

    assertUp(workflowUUID, {
        status: 400,
        message: "workflow-uuid: Param is required. Should contain the uuid of the workflow"
    });

    assertUp(taskAssignmentUUID, {
        status: 400,
        message: "task-assignment-uuid: Body Param is required. Should contain the uuid of the task assignment"
    });

    assertUp(rating, {
        status: 400,
        message: "rating: Body Param is required. Should contain the rating of the task assignment"
    });

    const taskAssignment = await db.task_assignment.findFirst({
        where: {
            uuid: taskAssignmentUUID
        }
    });

    assertUp(taskAssignment, {
        status: 404,
        message: "Task Assignment not found"
    });

    if(comment){
        comment = comment.trim();
    }
    if(rating){
        rating = rating.trim();

    }

    let ratingNumber = parseInt(rating);

    const reviewResult = await db.task_assignment.update({
        where: {
            uuid: taskAssignmentUUID
        },
        data: {
            review_rating: ratingNumber,
            review_comments: comment,
            status: accepted ? task_status.accepted : task_status.rejected,
            reviewer: {
                connect: {
                    email: email
                }
            }
        }
    });

    res.status(200).json(reviewResult);



})


export default reviewApi.handler;