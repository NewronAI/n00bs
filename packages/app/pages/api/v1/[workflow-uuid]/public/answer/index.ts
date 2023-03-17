import NextExpress from "@/helpers/node/NextExpress";
import assertUp from "@/helpers/node/assert/assertUp";
import getPublicWorkflowAPISecret from "@/helpers/getPublicWorkflowAPISecret";
import {db} from "@/helpers/node/db";
import {task_status} from "@prisma/client";

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

    assertUp(workflowUuid, {
        message: "Workflow UUID: Param is required. Should contain the uuid of the workflow",
        status: 400
    });

    const secret = req.body?.secret as string;

    assertUp(secret, {
        message: "Secret: Param is required. Should contain the secret of the workflow",
        status: 400
    });

    const calculatedSecret = await getPublicWorkflowAPISecret(workflowUuid);

    console.log("Secret: ", secret, calculatedSecret);

    assertUp(calculatedSecret === secret, {
        message: "secret: The secret is not valid",
        status: 400
    });

    const data = req.body.data as QuestionAnswer;

    assertUp(data, {
        message: "data: Param is required. Should contain the data of the answers",
        status: 400
    });

    const taskAssignmentUuid = data.task_assignment_uuid;

    assertUp(taskAssignmentUuid, {
        message: "task_assignment_uuid: Param is required. Should contain the uuid of the task assignment",
        status: 400
    })

    const responses = data.responses;

    assertUp(responses, {
        message: "responses: Param is required. Should contain the responses of the task assignment",
        status: 400
    });

    for(const response of responses) {
        const questionUuid = response.question_uuid;
        const answer = response.answer;

        assertUp(questionUuid, {
            message: "question_uuid: Param is required. Should contain the uuid of the question",
            status: 400
        });

        assertUp(answer, {
            message: "answer: Param is required. Should contain the answer of the question",
            status: 400
        });
    }


    const taskAssignment = await db.task_assignment.findFirst({
        where: {
            uuid: taskAssignmentUuid
        }
    })

    assertUp(taskAssignment, {
        message: "task_assignment_uuid: The task assignment uuid is not valid",
        status: 400
    });

    const questionIds : number[] = [];
    const expectedAnswers : (string | null)[] = [];

    for(const response of responses) {
        const question = await db.question.findFirstOrThrow({
            where: {
                uuid: response.question_uuid.trim()
            }
        });

        assertUp(question, {
            message: `question_uuid {${response.question_uuid}}: The question uuid is not valid`,
            status: 400
        });

        questionIds.push(question.id);
        expectedAnswers.push(question.expected_answer);
    }


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

    res.status(200).json(writeStatus);

});


export default publicAnswerApi.handler;