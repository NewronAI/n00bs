import assert from "assert";
import {NextApiRequest, NextApiResponse} from "next";

import {db} from "@/helpers/node/db";
import {workflow_type} from "@prisma/client";

import getLogger from "@/helpers/node/getLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { method } = req;

    const logger = getLogger("api/manager/v1/workflow/create.ts");

    try {
        assert(method === "POST", "Only POST requests are supported");
    }
    catch (e) {
        logger.error(e);
        res.status(405).end();
        return;
    }

    const { name, description, type: workflowType } = req.body;

    try {
        assert(name, "Name is required");
        assert(description, "Description is required");
        assert(workflowType, "Workflow type is required");
    }
    catch (e) {
        logger.error(e);
        res.status(400).end();
        return;
    }

    logger.info(`Creating workflow ${name} of type ${workflowType}`);

    try {
        const workflow = await db.workflow.create({
            data: {
                name: req.body.name,
                description: req.body.description,
                type: workflowType as workflow_type,
            }
        });

        logger.info(`Created workflow`);

        res.status(200).json(workflow);

    }
    catch (e) {
        res.status(500).end();
        return;
    }



}

export default handler;