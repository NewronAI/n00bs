import {NextApiRequest, NextApiResponse} from "next";
import assertHandler from "@/helpers/node/assert/assertHandler";
import getLogger from "@/helpers/node/getLogger";
import assertUp from "@/helpers/node/assert/assertUp";
import {db} from "@/helpers/node/db";
import {manager_role} from "@prisma/client";

const addManagerHandler = async (req: NextApiRequest, res: NextApiResponse) => {

    const { method } = req;

    const logger = getLogger("api/manager/v1/workflow/add-manager.ts");

    try {
        assertUp(method === "POST", {
            message: "Only POST requests are supported",
            status: 405
        });

        const { workflowUuid, email, role } = req.body;
        // TODO: change email source to session

        assertUp(workflowUuid, {
            message: "Workflow id is required",
            status: 400
        });

        assertUp(email, {
            message: "Email is required",
            status: 500
        });

        assertUp(role, {
            message: "Role is required",
        });
        // ToDo: check role is valid and is one of the manager_role enum


        logger.info(`Adding manager ${email} to workflow ${workflowUuid}`);

        const workflow = await db.workflow.findFirst({
            where: {
                uuid: workflowUuid
            }
        });

        assertUp(workflow, {
            message: "Workflow not found",
            status: 404
        });

        const workflowId = workflow.id;

        const manager = await db.workflow_manager.findFirst({
            where: {
                email
            }
        });

        assertUp(manager, {
            message: "Manager not found",
        });

        const managerId = manager.id;

        await db.workflow_manager_link.create({
            data: {
                workflow_id: workflowId,
                workflow_manager_id: managerId,
                role
            }
        });

        res.status(200).json( {
            message: "Manager added successfully"
        });

    }
    catch (e) {
        assertHandler(e, res);
    }
}

export default addManagerHandler;