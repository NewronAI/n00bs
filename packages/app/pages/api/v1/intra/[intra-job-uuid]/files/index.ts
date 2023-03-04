import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";

const intraJobFiles = new NextExpress();

intraJobFiles.get(async (req, res) => {

    const intraJobUUID = req.query["intra-job-uuid"] as string;

    const intraJob = await db.intra_pair_file.findMany({
        where: {
            intra_pair_job: {
                uuid: intraJobUUID
            }
        }
    });

    res.json(intraJob);

});

export default intraJobFiles.handler;