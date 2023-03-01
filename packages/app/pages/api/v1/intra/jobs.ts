import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";
import assertUp from "@/helpers/node/assert/assertUp";

const intraJobsAPI = new NextExpress();

intraJobsAPI.get(async (req, res) => {
    // Get all jobs
    const jobs = await db.intra_pair_job.findMany();
    res.status(200).json(jobs);
});

intraJobsAPI.post(async (req, res) => {
    // Create a new job
    const data = req.body.data;
    const fileName: string = req.body.fileName;



    assertUp(typeof data === "object" && data.length > 0, {
        status : 400,
        message: "Data must not be empty"
    });

    assertUp(fileName, {
        status: 400,
        message : "fileName is required in body"
    });

    const results = db.$transaction(async (tx) => {


    });



    res.status(200).json({});
});

export default intraJobsAPI.handler;