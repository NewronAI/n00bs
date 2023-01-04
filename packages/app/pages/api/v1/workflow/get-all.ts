import {NextApiRequest, NextApiResponse} from "next";

import {db} from "@/helpers/node/db";
import assertUp from "@/helpers/node/assert/assertUp";
import assertHandler from "@/helpers/node/assert/assertHandler";
import getLogger from "@/helpers/node/getLogger";
import {workflow} from "@prisma/client";
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { method } = req;

    const logger = getLogger("api/manager/v1/workflow/get-all.ts");

    try {

        assertUp(method === "GET", {
            message : "Only GET requests are supported",
            status : 405
        });


        logger.info(`Getting all workflows`);

        let workflowIds = new Set();

        let email = req.query.email as string; // TODO: change email source to session

        assertUp(email, {
            message : "Email is missing",
            status : 500
        });

        const managerAccount = await db.workflow_manager.findFirst({
            where: {
                email,
            }
        });


        assertUp(managerAccount, {
            message : "Manager account not found",
            status : 404
        });

        logger.info(`Manager account found`);

        let ownerId = managerAccount.id;

        const ownedWorkflows = await db.workflow.findMany({
            where: {
                owner_id: ownerId
            },
            orderBy: {
                createdAt: "desc",
            }
        });

        logger.info(`Owned workflows found`);

        const workFlows : workflow[] = [];

        ownedWorkflows.forEach((workflow) => {
            workflowIds.add(workflow.id);
        });

        workFlows.push(...ownedWorkflows);

        logger.info(ownedWorkflows);
        logger.info(workflowIds);

        const sharedWorkflows = await db.workflow.findMany({
            include: {
                workflow_managers: {
                    where: {
                        workflow_manager_id: ownerId
                    }
                }
            }
        });

        logger.info(`Shared workflows found`);

        workFlows.push(...sharedWorkflows);

        sharedWorkflows.forEach((workflow) => {
            workflowIds.add(workflow.id);
        });

        const uniqueWorkflows = [];

        const workflowIdsArray = Array.from(workflowIds);

        for(let workflowId of workflowIdsArray) {
            uniqueWorkflows.push(workFlows.find((workflow) => {
                return workflow.id === workflowId;
            }));
        }


        res.status(200).json(uniqueWorkflows);
    }
    catch (e) {
        assertHandler(e, res);
        return;
    }
}

export default handler;