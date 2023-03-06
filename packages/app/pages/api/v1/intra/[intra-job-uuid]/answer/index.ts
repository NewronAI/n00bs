import NextExpress from "@/helpers/node/NextExpress";
import {confidence_level, task_status} from "@prisma/client";
import {db} from "@/helpers/node/db";
import assertUp from "@/helpers/node/assert/assertUp";

const intraAnswerApi = new NextExpress();

intraAnswerApi.post(async (req, res) => {

    const intraJobUUID = req.query["intra-job-uuid"] as string;
    const intraFileUUID = req.body["file_uuid"] as string;
    const is_similar = req.body["is_similar"] as boolean;
    const confidence = req.body["confidence"] as confidence_level || confidence_level.high;

    assertUp(intraFileUUID, {
        message: "intraFileUUID is required",
        status: 400
    });

    assertUp(typeof is_similar === "boolean", {
        message: "is_similar is required",
        status: 400
    });

    assertUp(intraFileUUID, {
        message: "intraFileUUID is required",
        status: 400
    })

    await db.intra_pair_job.update({
        where: {
            uuid: intraJobUUID
        },
        data: {
            status: task_status.in_progress
        }
    });

    const updateStatus = await db.intra_pair_file.update({
        where: {
            uuid: intraFileUUID
        },
        data: {
            is_similar,
            confidence
        }
    })

    res.json(updateStatus);

});

export default intraAnswerApi.handler;