import NextExpress from "@/helpers/node/NextExpress";
import assertUp from "@/helpers/node/assert/assertUp";
import {db} from "@/helpers/node/db";
import {task_status} from "@prisma/client";
import {getSession} from "@auth0/nextjs-auth0";

const review_answers = new NextExpress();

review_answers.post(async (req, res) => {

    const workflowUUID = req.query["workflow-uuid"] as string;
    const session = await getSession( req , res);
    const email = session?.user.email;
    const taskRatings = new Map(req.body);
    console.log(taskRatings);

    assertUp(workflowUUID, {
        status: 400,
        message: "workflow-uuid: Param is required. Should contain the uuid of the workflow"
    });

    assertUp(taskRatings, {
        status: 400,
        message: "task-assignment-uuid: Body Param is required. Should contain the uuid of the task assignment"
    });

    // @ts-ignore
    for (const [key, value] of taskRatings) {
        const status = value >= 3 ? task_status.accepted : task_status.rejected
        try{
            const reviewResult = await db.task_assignment.update({
                where: {
                    uuid: key
                },
                data: {
                    review_rating: value,
                    status: status,
                    reviewer: {
                        connect: {
                            email: email
                        }
                    }
                }
            });
            console.log("Task with uuid: ",key,"rated successfully");
        }
        catch(err) {
            console.log("Task with uuid: ",key,"failed with err: ",err);
        }
      }

    res.status(200).json(`Success`);
})


export default review_answers.handler;