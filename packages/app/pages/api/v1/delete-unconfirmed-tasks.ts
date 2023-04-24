import {NextApiRequest, NextApiResponse} from "next";
import {MongoClient} from "mongodb";
import {db} from "@/helpers/node/db";
import axios from "axios";
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
            id: true,
        }
    });

    const notReceivedTaskIds = notReceivedTaskAssignments.map((assignment) => assignment.id);




    const receivedTasks = await  mongodbClient.db("notes").collection("ASSIGNEDAUDIOFILES").find({
        id: {
            $in: notReceivedTaskIds
        }
    }).toArray();

    await mongodbClient.close();

    const receivedTasksId = receivedTasks.map((task) => task.id);

    const notReceivedTasks = notReceivedTaskIds.filter((assignment) => !receivedTasksId.includes(assignment));

    console.log(notReceivedTasks.length);



    console.log(receivedTasks.length);

    // await db.task_assignment.deleteMany({
    //     where: {
    //         id: {
    //             in: notReceivedTasks
    //         }
    //     }
    // });

    res.status(200).json({
        success: true,
        data: {
            length: notReceivedTasks.length,
            notReceivedTasks
        }
    });


}

export default reconcileAnswers;