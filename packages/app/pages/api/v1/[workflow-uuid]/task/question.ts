import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";
import assertUp from "@/helpers/node/assert/assertUp";

const addQuestionAPI = new NextExpress();

addQuestionAPI.post(async (req,res) => {

    const taskUUID = req.query["task-uuid"] as string;
    const questionUUID = req.query["question-uuid"] as string;

    const task = await db.task.findFirst({
        where: {
            uuid: taskUUID
        }
    });

    assertUp(task, {
        status: 404,
        message: "Task not found"
    });

    const question = await db.question.findFirst({
        where: {
            uuid: questionUUID
        }
    });

    assertUp(question, {
        status: 404,
        message: "Question not found"
    });

    const status = await db.task_question.create({
        data: {
            task_id: task.id,
            question_id: question.id
        }
    });

    res.status(200).json(status);

});


addQuestionAPI.delete(async (req,res) => {

        const taskUUID = req.query["task-uuid"] as string;
        const questionUUID = req.query["question-uuid"] as string;

        const task = await db.task.findFirst({
            where: {
                uuid: taskUUID
            }
        });

        assertUp(task, {
            status: 404,
            message: "Task not found"

        });

        const question = await db.question.findFirst({
            where: {
                uuid: questionUUID
            }
        });

        assertUp(question, {
            status: 404,
            message: "Question not found"
        });

        const obj = await db.task_question.findFirst({
            where: {
                task_id: task.id,
                question_id: question.id
            }
        });

        assertUp(obj, {
            status: 404,
            message: "Question entry not found in task"
        });

        const status = await db.task_question.delete({
            where: {
                id: obj.id
            }
        });

        res.status(200).json(status);

});




export default addQuestionAPI.handler;