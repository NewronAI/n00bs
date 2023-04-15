import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";
import assertUp from "@/helpers/node/assert/assertUp";
import {Prisma} from "@prisma/client";
import {NextApiRequest, NextApiResponse} from "next";
import getPublicWorkflowAPISecret from "@/helpers/getPublicWorkflowAPISecret";
import getLogger from "@/helpers/node/getLogger";

const fileApi = new NextExpress();

fileApi.post(async (req: NextApiRequest, res: NextApiResponse) => {

    const workflowUuid = req.query?.["workflow-uuid"] as string;

    const logger = getLogger(`/api/v1/${workflowUuid}/public/file/index`);

    assertUp(workflowUuid, {
        message: "Workflow UUID: Param is required. Should contain the uuid of the workflow",
        status: 400
    });

    const secret = req.body?.secret as string;

    const data = req.body.data as Prisma.workflow_fileSelect[];

    logger.debug(`secret: ${secret}`);

    assertUp(secret, {
        message: "Secret: Param is required. Should contain the secret of the workflow",
        status: 400
    });

    const calculatedSecret = await getPublicWorkflowAPISecret(workflowUuid);

    logger.debug(`calculatedSecret : ${calculatedSecret}`);

    console.log("Secret: ", secret, calculatedSecret);

    assertUp(calculatedSecret === secret, {
        message: "Secret: The secret is not valid",
        status: 400
    });


    for(const item of data) {
        const file = item
        const fileName = item.file_name;
        const fileType = item.file_type;

        assertUp(file, {
            message: "File: Param is required. Should contain the url of the file",
            status: 400
        });

        assertUp(fileName, {
            message: "File Name: Param is required. Should contain the name of the file",
            status: 400
        });

        assertUp(fileType, {
            message: "File Type: Param is required. Should contain the type of the file",
            status: 400
        });
    }

    const workflow = (await db.workflow.findFirstOrThrow({
        where: {
            uuid: workflowUuid
        }
    }));

    const workflowId = workflow.id;

    logger.debug(`workflow ${JSON.stringify(workflow)}`);


    // @ts-ignore
    const newFile = await db.workflow_file.createMany({data: data.map(item => {
            return {
                ...item,
                workflow_id: workflowId,
            }
        })
    });

    logger.debug(`newFile : ${JSON.stringify(newFile)}`);

    res.status(200).json(newFile);

});

export default fileApi.handler;