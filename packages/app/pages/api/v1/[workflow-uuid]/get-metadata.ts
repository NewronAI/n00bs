import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";
import assertUp from "@/helpers/node/assert/assertUp";

const getWorkFlowMetadata = new NextExpress();

getWorkFlowMetadata.get(async (req, res) => {

    const workflowUuid = req.query?.["workflow-uuid"] as string;

    assertUp(workflowUuid, {
        message: "Workflow UUID: Param is required. Should contain the uuid of the workflow",
        status: 400
    });

    const workflowMetadata = await db.workflow.findFirst({
        where: {
            uuid: workflowUuid
        }
    });

    res.status(200).json(workflowMetadata);
});

export default getWorkFlowMetadata.handler;