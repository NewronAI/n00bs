import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";

const intraJobsAPI = new NextExpress();

intraJobsAPI.get(async (req, res) => {
    // Get all jobs
    const jobs = await db.intra_pair_job.findMany();
    res.status(200).json(jobs);
});

// intraJobsAPI.post(async (req, res) => {
//     // Create a new job
//     const jobName = req.body.name as string;
//     const jobDescription = req.body.description as string;
//
//     const job = await db.intra_pair_job.create({
//         data: {
//             name: jobName,
//             description: jobDescription,
//
//         }
//     });
//
//     res.status(200).json(job);
// });

