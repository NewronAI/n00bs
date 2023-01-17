import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";
import {NextApiRequest, NextApiResponse} from "next";

const fileApi = new NextExpress();

fileApi.get(async (req : NextApiRequest, res : NextApiResponse) => {
    // Get all files

    const start = req.query.start as unknown as number || undefined;
    const offset = req.query.start as unknown as number || undefined;

    const files = await db.workflow_file.findMany({
        skip: start,
        take: offset
    });
    res.status(200).json(files);

});

export default fileApi.handler;