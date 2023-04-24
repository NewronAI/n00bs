import {NextApiRequest, NextApiResponse} from "next";
import {MongoClient} from "mongodb";
import {db} from "@/helpers/node/db";
import getPublicWorkflowAPISecret from "@/helpers/getPublicWorkflowAPISecret";

const mongodbClient = new MongoClient(process.env.CHATBOT_MONGO_URL as string);

const workflow_uuids = ['2ddba7f3-798c-40bb-b687-d25a7180982a', 'e95bf9c5-8689-4731-abcd-49bc267e9607'];

const getWorkflowUuid = (task_id : number) => workflow_uuids[task_id - 1];
const reconcileAnswers = async (req: NextApiRequest, res: NextApiResponse) => {

    const notReceivedTaskAssignments = await db.task_assignment.findMany({
        where: {
            status: "pending",
            // task_id: 1
        },
        select: {
            uuid: true,
            id: true,
        }
    });

    const notReceivedFilesId = notReceivedTaskAssignments.map((assignment) => assignment.id);




    const notReceivedFilesData = await  mongodbClient.db("notes").collection("ASSIGNEDAUDIOFILES").find({
        $and : [
            {
                answers: {
                    $not: {
                        $elemMatch: {
                            answer: { $eq: null }
                        }
                    }
                }
            },
            {
                id: {
                    $in: notReceivedFilesId
                }
            }
        ]
    }).toArray();

    await mongodbClient.close();

    let failedFiles = 0;

    for (let file of notReceivedFilesData) {
        try {
            const workflowUUID = getWorkflowUuid(file.task_id);

            console.log(JSON.stringify({
                secret: await getPublicWorkflowAPISecret(workflowUUID),
                data: {
                    task_assignment_uuid: file.uuid,
                    responses: [...file.answers.map((answer: any) => ({
                        question_uuid: answer.question_uuid,
                        answer: answer.answer
                    }))]
                }
            }, null, 2));
            // await axios.post(`http://localhost:3000/api/v1/${workflowUUID}/public/answer`, {
            //     secret: await getPublicWorkflowAPISecret(workflowUUID),
            //     data: {
            //         task_assignment_uuid: file.uuid,
            //         responses: [...file.answers.map((answer: any) => ({
            //             question_uuid: answer.question_uuid,
            //             answer: answer.answer
            //         }))]
            //     }
            // });
        } catch (e) {
            failedFiles++;
            // @ts-ignore
            console.log(e?.response?.data?.message);
        }
    }

    res.json({
        totalTasks : notReceivedTaskAssignments.length,
        found : notReceivedFilesData.length,
        failed : failedFiles
    });


}

export default reconcileAnswers;