import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";
import assertUp from "@/helpers/node/assert/assertUp";

const workflowApi = new NextExpress();

workflowApi.get(async (req, res) => {
    // Get all workflows

    const workflows = await db.workflow.findMany({
        orderBy: {
            createdAt: "asc"
        }
    });

    res.status(200).json(workflows);

});

workflowApi.post(async (req, res) => {
    // Create a new workflow

    const workflowName = req.body.name as string;
    const workflowDescription = req.body.desc as string;


    assertUp(workflowName, {
        message: "Workflow name is required",
        status: 400
    });


    // @ts-ignore
    const workflow = await db.workflow.create(
        {
            data: {
                name: workflowName,
                desc: workflowDescription

            }
        }
    )

    // also add a default task

    await db.task.create({
        data: {
            name: "Default Task",
            workflow: {
                connect: {
                    id: workflow.id
                }
            }
        }
    });

    res.status(200).json(workflow);

})



export default workflowApi.handler;