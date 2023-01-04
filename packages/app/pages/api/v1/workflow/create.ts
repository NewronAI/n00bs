import assert from "assert";
import {NextApiRequest, NextApiResponse} from "next";

import {db} from "@/helpers/node/db";
import {manager_role, workflow_type} from "@prisma/client";

import getLogger from "@/helpers/node/getLogger";
import assertUp from "@/helpers/node/assert/assertUp";
import assertHandler from "@/helpers/node/assert/assertHandler";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { method } = req;

    const logger = getLogger("api/manager/v1/workflow/create.ts");

    try {
        assertUp(method === "POST", {
            message: "Only POST requests are supported",
            status: 405
        });

        const { name, description, type: workflowType, email } = req.body;

        // TODO: change email source to session


        assertUp(name && name.length < 30, {
            message: "Name is required. Max length is 30 characters",
            status: 400
        });

        assertUp(description && description.length < 200, {
            message: "Description is required. Max length is 200 characters",
            status: 400
        });

        assertUp(workflowType, {
            message: "Workflow type is required",
            status: 400
        });
        // ToDo: check workflowType is valid and is one of the workflow_type enum

        assertUp(email, {
            message: "Email is required",
            status: 400
        });


        logger.info(`Creating workflow ${name} of type ${workflowType}`);


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
                workflow_managers : {
                    create : [
                        {
                            role : manager_role.ADMIN,
                            workflow_manager_id : managerAccount.id

                        }
                    ]
                }
            }
        });

        logger.info(`Created workflow : ${workflow.name}`);

        res.status(200).json(workflow);

    }
    catch (e) {
        assertHandler(e, res);
        return;
    }

}

export default handler;