import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";
import {obj_status, question_type} from "@prisma/client";
import assertUp from "@/helpers/node/assert/assertUp";
import getLogger from "@/helpers/node/getLogger";

const editresponse = new NextExpress();

const logger = getLogger("api/v1/edit-response");

editresponse.post(async (req, res) => {
    //Edit the response

    const taskAssignmentUUID = req.query.taskAssignmentUUID as string;
    const questionUUID = req.query.questionUUID as string;

    console.log("Api called",taskAssignmentUUID,questionUUID)

    // const updatedAnswer = await db.task_assignment.update({
    //     where: {
    //         uuid: taskAssignmentUUID,
    //     },
    // })

    res.status(200).json(taskAssignmentUUID);
});

export default editresponse.handler;