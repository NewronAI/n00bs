import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";
import assertUp from "@/helpers/node/assert/assertUp";
import {Prisma} from "@prisma/client";

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
            const job = await tx.intra_pair_job.create({
                data: {
                    name: fileName,
                }
            });

            const files = await tx.intra_pair_file.createMany({
                data: data.map((pair : Prisma.intra_pair_fileCreateInput ) => {
                    return {
                        intra_pair_job_id: job.id,
                        ...pair
                    }
                })
            });

            return {
                job,
                files
            }
    });

    res.status(200).json(results);
});

export default intraJobsAPI.handler;