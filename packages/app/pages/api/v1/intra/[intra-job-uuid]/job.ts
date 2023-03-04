import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";

const intraJobData = new NextExpress();

intraJobData.get(async (req, res) => {

    const intraJobUUID = req.query["intra-job-uuid"] as string;

    const intraJob = await db.intra_pair_job.findFirst({
        where: {
            uuid: intraJobUUID
        },
        include: {
            intra_pair_files: {
                orderBy: {
                    id: "asc"
                }
            },
            created_by: true,
            assigned_to: true
        }
    });

    res.json(intraJob);

});

export default intraJobData.handler;