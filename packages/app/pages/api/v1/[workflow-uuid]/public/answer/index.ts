import NextExpress from "@/helpers/node/NextExpress";
import assertUp from "@/helpers/node/assert/assertUp";
import getPublicWorkflowAPISecret from "@/helpers/getPublicWorkflowAPISecret";
import {db} from "@/helpers/node/db";
import {task_status} from "@prisma/client";
import getLogger from "@/helpers/node/getLogger";

export const config = {
    api: {
      responseLimit: false,
    },
  }

const publicAnswerApi = new NextExpress();

type QuestionAnswer = {
    task_assignment_uuid: string,
    responses: [
        {
            question_uuid: string,
            answer: string
        }
    ]

}

publicAnswerApi.post(async (req, res) => {

    const workflowUuid = req.query?.["workflow-uuid"] as string;

    const logger = getLogger(`/api/v1/${workflowUuid}/public/answer`);
    logger.debug("Answering question");

    logger.debug(`"Workflow UUID: ", ${workflowUuid}`);

    assertUp(workflowUuid, {
        message: "Workflow UUID: Param is required. Should contain the uuid of the workflow",
        status: 400
    });


    const secret = req.body?.secret as string;

    logger.debug(`"Secret: ", ${secret}`);

    assertUp(secret, {
        message: "Secret: Param is required. Should contain the secret of the workflow",
        status: 400
    });

    const calculatedSecret = await getPublicWorkflowAPISecret(workflowUuid);

    logger.debug(`"Calculated secret: ${calculatedSecret} , calculatedSecret ===  secret`);

    assertUp(calculatedSecret === secret, {
        message: "secret: The secret is not valid",
        status: 400
    });

    logger.debug("Secret is valid");

    const data = req.body.data as QuestionAnswer;

    logger.debug(`Data: , ${JSON.stringify(data)}`);

    assertUp(data, {
        message: "data: Param is required. Should contain the data of the answers",
        status: 400
    });

    logger.debug("Data is valid");

    const taskAssignmentUuid = data.task_assignment_uuid;

    logger.debug("Task assignment UUID: ", taskAssignmentUuid);

    assertUp(taskAssignmentUuid, {
        message: "task_assignment_uuid: Param is required. Should contain the uuid of the task assignment",
        status: 400
    })

    logger.debug("Task assignment UUID is valid");

    const responses = data.responses;

    assertUp(responses, {
        message: "responses: Param is required. Should contain the responses of the task assignment",
        status: 400
    });

    logger.debug("Responses is valid");

    for(const response of responses) {
        const questionUuid = response.question_uuid;
        const answer = response.answer;

        logger.debug("Question UUID: ", questionUuid);

        assertUp(questionUuid, {
            message: "question_uuid: Param is required. Should contain the uuid of the question",
            status: 400
        });

        logger.debug("Question UUID is valid");
        logger.debug("Answer: ", answer);

        assertUp(answer, {
            message: "answer: Param is required. Should contain the answer of the question",
            status: 400
        });

        logger.debug("Answer is valid");
    }


    const taskAssignment = await db.task_assignment.findFirst({
        where: {
            uuid: taskAssignmentUuid
        }
    })

    logger.debug("Task assignment: ", taskAssignment);

    assertUp(taskAssignment, {
        message: "task_assignment_uuid: The task assignment uuid is not valid",
        status: 400
    });

    logger.debug("Task assignment is valid");

    const questionIds : number[] = [];
    const expectedAnswers : (string | null)[] = [];

    for(const response of responses) {

        logger.debug("Question UUID: ", response.question_uuid);

        const question = await db.question.findFirstOrThrow({
            where: {
                uuid: response.question_uuid.trim()
            }
        });

        logger.debug("Question: ", question);

        assertUp(question, {
            message: `question_uuid {${response.question_uuid}}: The question uuid is not valid`,
            status: 400
        });

        logger.debug("Question is valid");

        questionIds.push(question.id);
        expectedAnswers.push(question.expected_answer);

        logger.debug("Question ID: ", question.id);

    }

    logger.debug("Question IDs: ", questionIds);

    const [writeStatus] = await db.$transaction([
        db.task_answer.createMany({
            data: responses.map((response, i) => {
                return {
                    task_assignment_id: taskAssignment.id,
                    question_id: questionIds[i],
                    answer: response.answer,
                    is_expected: expectedAnswers[i] ? response.answer === expectedAnswers[i] : null
                }
            })
        }),
        db.task_assignment.update({
            where: {
                id: taskAssignment.id
            },
            data: {
                status: task_status.in_progress
            }
        })
    ]);

    logger.debug("Write status: ", writeStatus);

    res.status(200).json(writeStatus);

});


export default publicAnswerApi.handler;