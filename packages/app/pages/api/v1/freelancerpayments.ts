import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";
import {obj_status, question_type} from "@prisma/client";
import assertUp from "@/helpers/node/assert/assertUp";
import getLogger from "@/helpers/node/getLogger";
import { includes } from "lodash";

const freelancerpayments = new NextExpress();

const logger = getLogger("api/v1/freelancerpayments");

freelancerpayments.get(async (req, res) => {
    const filesData_WF1 = await db.workflow_file.findMany({
        where: { workflow_id: 1},
        include: {
            task_assignments: {
                include: {
                    task_answers: true,
                }
            },
        }
    })

    const filesData_WF2 = await db.workflow_file.findMany({
        where: { workflow_id: 2},
        include: {
            task_assignments: {
                include: {
                    task_answers: true,
                }
            },
        }
    })

    const filesData = filesData_WF1

    res.status(200).json(filesData_WF2);
});

export default freelancerpayments.handler;
