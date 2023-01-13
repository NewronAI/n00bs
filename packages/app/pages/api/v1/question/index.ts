import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";
import { question_type} from "@prisma/client";

const questionApi = new NextExpress();

questionApi.get(async (req, res) => {
    // Get all questions
    const questions = await db.question.findMany();
    res.status(200).json(questions);
});


questionApi.post(async (req, res) => {
    // Create a new question

    const questionName = req.body.name as string;
    const questionText = req.body.text as string;

    const questionType = req.body.type as question_type;

    const questionOptions = req.body.options as string[];

    const question = await db.question.create({
        data: {
            name: questionName,
            text: questionText,
            question_type: questionType,
            options: questionOptions

        }
    });

    res.status(200).json(question);
});