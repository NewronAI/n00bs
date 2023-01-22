import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";
import assertUp from "@/helpers/node/assert/assertUp";

const unassignedFilesApi = new NextExpress();

unassignedFilesApi.get(async (req, res) => {

    const workflowUUID = req.query.workflowUuid as string;

    const workflow = await db.workflow.findFirst({
        where: {
            uuid: workflowUUID
        },
        include: {
            tasks: true
        }
    });

    assertUp(workflow, {
        status: 404,
        message: "Workflow not found"
    });

    const unassignedFiles = await db.$queryRaw``

    res.status(200).json(unassignedFiles);

});

export default unassignedFilesApi.handler;