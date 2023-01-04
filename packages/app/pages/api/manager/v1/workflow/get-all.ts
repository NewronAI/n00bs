import {NextApiRequest, NextApiResponse} from "next";

import {db} from "@/helpers/node/db";
import assert from "assert";
import assertUp from "@/helpers/node/assert/assertUp";
import assertHandler from "@/helpers/node/assert/assertHandler";
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { method } = req;

    try {
        assert(method === "GET", "Only GET requests are supported");
    }
    catch (e) {
        let err = e as Error;
        res.status(405).json({message: err.message});
        res.end();
        return;
    }


    let workflows = new Set();

    let email = req.query.email as string; // TODO: change email source to session

    try {

        const managerAccount = await db.workflow_manager.findFirst({
            where: {
                email,
            }
        });

        assertUp(managerAccount, {
            message : "Manager account not found",
            status : 404
        });

        let ownerId = managerAccount.id;

        const ownedWorkflows = await db.workflow.findMany({
            where: {
                owner_id: ownerId
            },
            orderBy: {
                createdAt: "desc",
            }
        });

        workflows.add(ownedWorkflows);

        const sharedWorkflows = await db.workflow.findMany({
            include: {
                workflow_managers: {
                    where: {
                        workflow_manager_id: ownerId
                    }
                }
            }
        });

        workflows.add(sharedWorkflows);

        res.status(200).json(workflows);
    }
    catch (e) {
        assertHandler(e as Error, res);
        return;
    }
}

export default handler;