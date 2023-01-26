import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";
import {NextApiRequest, NextApiResponse} from "next";
import {obj_status} from "@prisma/client";
import assertUp from "@/helpers/node/assert/assertUp";

const fileApi = new NextExpress();

const pageSize = 10;

// fileApi.get(async (req : NextApiRequest, res : NextApiResponse) => {
//     // Get all files
//
//     const page = Number(req.query.page as string) || 0;
//     const workflowUuid = req.query?.["workflow-uuid"] as string;
//
//     const files = await db.workflow_file.findMany({
//         skip: page * pageSize,
//         take: pageSize,
//         where: {
//             workflow: {
//                 uuid: workflowUuid
//             }
//         }
//     });
//
//     const count = await db.workflow_file.count({
//         where: {
//             status: obj_status.active,
//             workflow: {
//                 uuid: workflowUuid
//             }
//         }
//     });
//
//
//     res.status(200).json({
//         data: files,
//         pageInfo: {
//             currentPage: page,
//             pageSize: pageSize,
//             totalPages: Math.ceil(count / pageSize),
//             totalItems: count,
//             nextAvailable: page < Math.ceil(count / pageSize),
//             prevAvailable: page > 0
//         }
//     });
//
// });


fileApi.get(async (req : NextApiRequest, res : NextApiResponse) => {
    // Get all files

    const workflowUuid = req.query?.["workflow-uuid"] as string;

    assertUp(workflowUuid, {
        status: 400,
        message: "Workflow UUID is required"
    });

    const files = await db.workflow_file.findMany({
        where: {
            workflow: {
                uuid: workflowUuid
            }
        }
    });

    console.log(files);

    res.status(200).json(files);

})

export default fileApi.handler;