import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";
import assertUp from "@/helpers/node/assert/assertUp";
import {Prisma} from "@prisma/client";

export const config = {
    api: {
      responseLimit: false,
    },
  }

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

taskApi.put(async (req, res) => {

    const workflowUUID = req.query["workflow-uuid"] as string;
    const fileUUID = req.query["uuid"] as string;
    const task = req.body.data as Prisma.taskUpdateInput;

    const workflow = await db.workflow.findFirst({
        where: {
            uuid: workflowUUID
        }
    });

    assertUp(workflow, {
        status: 404,
        message: "Workflow not found"
    });

    const updatedTask = await db.task.update({
        where: {
            uuid: fileUUID
        },
        data: task
    });

    res.status(200).json(updatedTask);

});


export default taskApi.handler;