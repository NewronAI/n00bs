import NextExpress from "@/helpers/node/NextExpress";
import {confidence_level} from "@prisma/client";
import {db} from "@/helpers/node/db";
import assertUp from "@/helpers/node/assert/assertUp";

const intraAnswerApi = new NextExpress();

intraAnswerApi.post(async (req, res) => {

    const intraFileUUID = req.body["file_uuid"] as string;
    const is_similar = req.body["is_similar"] as boolean;
    const confidence = req.body["confidence"] as confidence_level || confidence_level.high;

    assertUp(intraFileUUID, {
        message: "intraFileUUID is required",
        status: 400
    });

    assertUp(is_similar, {
        message: "is_similar is required",
        status: 400
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