import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";
import {task_status} from "@prisma/client";
import assertUp from "@/helpers/node/assert/assertUp";

const intraJobCompleteApi = new NextExpress();

intraJobCompleteApi.post(async (req, res) => {

    const intraJobUUID = req.query["intra-job-uuid"] as string;
    const threshold = req.body.threshold as number;

    assertUp(threshold, {
        message: "Threshold is required",
        status: 400
    });

    assertUp(intraJobUUID, {
        message: "Intra Job UUID is required",
        status: 400
    });


    const intraJob = await db.intra_pair_job.update({
        where: {
            uuid: intraJobUUID
        },
        data: {
            status: task_status.completed,
            threshold: threshold
        }
    });

    res.json(intraJob);

});

export default intraJobCompleteApi.handler;