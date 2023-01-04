import {NextApiRequest, NextApiResponse} from "next";
import assertHandler from "@/helpers/node/assert/assertHandler";
import assertUp from "@/helpers/node/assert/assertUp";
import {db} from "@/helpers/node/db";

const getManagersHandler = async (req: NextApiRequest, res: NextApiResponse) => {

    const method = req.method;

    try{
        assertUp(method === "GET", {
            status: 405,
            message: "Method not allowed"
        });

        const { workflowUuid } = req.query;

        assertUp(workflowUuid, {
            status: 400,
            message: "Workflow id is required"
        });

        const uuid = workflowUuid as unknown as string;

        const workflow = await db.workflow.findFirst({
            where: {
                uuid
            },
            select: {
                workflow_managers: {
                    include: {
                        workflow_manager : true
                    }
                }
            }
        });

        assertUp(workflow, {
            status: 404,
        });

        const managers = workflow.workflow_managers.map((manager) => {
            return {
                email: manager.workflow_manager.email,
                role: manager.role
            }
        });

        res.status(200).json(managers);

    }
    catch (e) {
        assertHandler(e, res);
    }

}

export default getManagersHandler;