import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";

const taskApi = new NextExpress();

// API will return the list of current task in the workflow
taskApi.get(async (req, res) => {
    // Get all tasks, as per Mr. Srikant, keep it as simple as possible

    const workflowUUID = req.query["workflow-uuid"] as string;

    const tasks = await db.task.findFirst({
       where: {
           workflow: {
                uuid: workflowUUID
           }
       },
        include: {
           task_questions: true
        }
    });

    res.status(200).json(tasks);

});

export default taskApi.handler;