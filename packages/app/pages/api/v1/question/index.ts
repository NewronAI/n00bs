import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";
import {obj_status, question_type} from "@prisma/client";
import assertUp from "@/helpers/node/assert/assertUp";
import getLogger from "@/helpers/node/getLogger";

const questionApi = new NextExpress();

const logger = getLogger("api/v1/question");

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
    const order = req.body.order as number | undefined;
    const required = req.body.required as boolean | undefined;

    const questionOptions = req.body.options as string[];
    const expectedAnswer = req.body.expected_answer as string | undefined;

    const question = await db.question.create({
        data: {
            name: questionName,
            text: questionText,
            question_type: questionType,
            options: questionOptions,
            order: Number(order),
            required: required,
            expected_answer: expectedAnswer,
        }
    });

    res.status(200).json(question);
});

questionApi.put(async (req, res) => {
    // Update a question

    logger.info("Updating question");
    const questionUUID = req.body.uuid as string;

    logger.info("Getting question, uuid: " + questionUUID);

    assertUp(questionUUID, {
        message: "Question UUID is required",
        status: 400
    });

    const questionName = req.body.name as string;
    const questionText = req.body.text as string;

    assertUp(questionName, {
        message: "Question name is required",
        status: 400
    });

    assertUp(questionText, {
        message: "Question text is required",
        status: 400
    });

    const questionType = req.body.type as question_type | undefined;
    const questionOptions = req.body.options as string[] | undefined;
    const status = req.body.status as obj_status | undefined;
    const order = req.body.order as number | undefined;
    const required = req.body.required as boolean | undefined;
    const expectedAnswer = req.body.expected_answer as string | undefined;

    logger.info("Updating question,");
    logger.info("uuid: " + questionUUID);
    logger.info("name: " + questionName);
    logger.info("text: " + questionText);
    logger.info("type: " + questionType);
    logger.info("options: " + questionOptions);
    logger.info("status: " + status);
    logger.info("order: " + order);
    logger.info("required: " + required);
    logger.info("expectedAnswer: " + expectedAnswer);


    const question = await db.question.update({
        where: {
            uuid: questionUUID
        },
        data: {
            name: questionName,
            text: questionText,
            question_type: questionType,
            options: questionOptions,
            status: status,
            required: required,
            order: Number(order),
            expected_answer: expectedAnswer,
        }
    });

    res.status(200).json(question);

});


export default questionApi.handler;