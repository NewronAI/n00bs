import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";
import assertUp from "@/helpers/node/assert/assertUp";
import {Prisma, task_status} from "@prisma/client";
import {getSession} from "@auth0/nextjs-auth0";

const intraJobsAPI = new NextExpress();

intraJobsAPI.get(async (req, res) => {
    // Get all jobs

    const data = await db.$queryRaw`SELECT job.*, COUNT(files.id) as files_count,  
        created_by.name as created_by_name, created_by.email as created_by_email,
        assignee.name as assignee_name, assignee.email as assignee_email,
        assignee.uuid as assignee_uuid
    FROM intra_pair_job job
    LEFT JOIN intra_pair_file files ON files.intra_pair_job_id = job.id
    LEFT JOIN member created_by ON created_by.id = job.created_by_id
    LEFT JOIN member assignee ON assignee.id = job.assigned_to_id
    GROUP BY job.id, created_by.id, assignee.id
    ORDER BY job.id DESC
    `;

    console.log(data);
    res.json(data);

});

intraJobsAPI.post(async (req, res) => {
    // Create a new job
    const data = req.body.data;
    const fileName: string = req.body.fileName;

    const session = await getSession(req, res);

    assertUp(session, {
            status: 401,
            message: "Unauthorized"
    });

    const email = session.user.email;

    assertUp(typeof data === "object" && data.length > 0, {
        status : 400,
        message: "Data must not be empty"
    });

    assertUp(fileName, {
        status: 400,
        message : "fileName is required in body"
    });

        const jobExist = await db.intra_pair_job.findFirst({
            where: {
                name: fileName
            }
        })

        assertUp(!jobExist, {
            status: 400,
            message: "Job already exist"
        });

        const results = db.$transaction(async (tx) => {

            const job = await tx.intra_pair_job.create({
                data: {
                    name: fileName,
                    created_by: {
                        connect: {
                            email
                        }
                    }
                }
            });


            try{
                const files = await tx.intra_pair_file.createMany({
                    data: data.map((pair: Prisma.intra_pair_fileCreateInput) => {
                        console.log(pair);
                        return {
                            intra_pair_job_id: job.id,
                            file_name: pair.file_name,
                            file: pair.file,
                            is_reference: Boolean(pair.is_reference),
                            cosine_score : pair.cosine_score
                        }
                    })
                });

                return {
                    job,
                    files
                }
            }
            catch (e) {
                throw new Error("Error creating files");
            }

    });

    res.status(200).json(results);
});

export default intraJobsAPI.handler;