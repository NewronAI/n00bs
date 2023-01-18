import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";
import {NextApiRequest, NextApiResponse} from "next";
import {obj_status} from "@prisma/client";

const fileApi = new NextExpress();

const pageSize = 10;

fileApi.get(async (req : NextApiRequest, res : NextApiResponse) => {
    // Get all files

    const page = Number(req.query.page as string) || 0;

    const files = await db.workflow_file.findMany({
        skip: page * pageSize,
        take: pageSize,
    });

    const count = await db.workflow_file.count({
        where: {
            status: obj_status.active
        }
    });

    res.status(200).json({
        data: files,
        pages: Math.ceil(count / pageSize),
        currentPage: page
    })


});

export default fileApi.handler;