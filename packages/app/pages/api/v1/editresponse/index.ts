import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";
import assertUp from "@/helpers/node/assert/assertUp";
import getLogger from "@/helpers/node/getLogger";

const editresponse = new NextExpress();

const logger = getLogger("api/v1/editresponse");

editresponse.post(async (req, res) => {
    //Edit the response

    const taskAssignmentUUID = req.query.taskAssignmentUUID as string;
    const questionUUID = req.query.questionUUID as string;
    const newValue = req.query.value as string;

    assertUp(taskAssignmentUUID, {
        status: 400,
        message: "Task Assignment UUID : Param is required. Should contain the uuid of the Task Assignment"
    });

    assertUp(questionUUID, {
        status: 400,
        message: "Question UUID: Param is required. Should contain the uuid of the Question"
    });

    const taskAnswer = await db.task_answer.findFirstOrThrow({
        where: {
            task_assignment: {
                uuid: taskAssignmentUUID,
            },
            question: {
                uuid: questionUUID,
            }
        }
    })


    assertUp(taskAnswer, {
        status: 404,
        message: "Task Answer not found"
    });

    try{
        const newAnswer = await db.task_answer.update({
            where: {
                uuid: taskAnswer.uuid,
            },
            data: {
                answer: newValue
            }
        })
        res.status(200).json("Answer updated successfully");
    } catch (err) {
        res.status(400).json("Could'nt updated the answer");
    }
});

export default editresponse.handler;
