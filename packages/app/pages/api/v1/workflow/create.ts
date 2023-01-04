import assert from "assert";
import {NextApiRequest, NextApiResponse} from "next";

import {db} from "@/helpers/node/db";
import {workflow_type} from "@prisma/client";

import getLogger from "@/helpers/node/getLogger";
import assertUp from "@/helpers/node/assert/assertUp";
import assertHandler from "@/helpers/node/assert/assertHandler";

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

    const { name, description, type: workflowType, email } = req.body;

    // TODO: change email source to session

    try {
        assert(name, "Name is required");
        assert(description, "Description is required");
        assert(workflowType, "Workflow type is required");
        assert(email, "Email is required");
    }
    catch (e) {
        logger.error(e);
        res.status(400).end();
        return;
    }

    logger.info(`Creating workflow ${name} of type ${workflowType}`);

    try {

        const managerAccount = (await db.workflow_manager.findFirst({
            where: {
                email,
            }
        }));

        assertUp(managerAccount, {
            message : "Manager account not found",
            status : 404
        });

        const workflow = await db.workflow.create({
            data: {
                name: req.body.name,
                description: req.body.description,
                type: workflowType as workflow_type,
                owner_id: managerAccount.id,
            }
        });

        logger.info(`Created workflow`);

        res.status(200).json(workflow);

    }
    catch (e) {
        logger.error(e);
        assertHandler(e, res);
        return;
    }



}

export default handler;