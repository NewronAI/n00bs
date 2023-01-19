import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";
import assertUp from "@/helpers/node/assert/assertUp";
import {file_type} from "@prisma/client";
import {NextApiRequest, NextApiResponse} from "next";
import getPublicWorkflowAPISecret from "@/helpers/getPublicWorkflowAPISecret";

const fileApi = new NextExpress();

fileApi.post(async (req: NextApiRequest, res: NextApiResponse) => {

    const workflowUuid = req.query?.["workflow-uuid"] as string;

    assertUp(workflowUuid, {
        message: "Workflow UUID: Param is required. Should contain the uuid of the workflow",
        status: 400
    });

    const secret = req.body?.secret as string;

    assertUp(secret, {
        message: "Secret: Param is required. Should contain the secret of the workflow",
        status: 400
    });

    const calculatedSecret = await getPublicWorkflowAPISecret(workflowUuid);

    console.log("Secret: ", secret, calculatedSecret);

    assertUp(calculatedSecret === secret, {
        message: "Secret: The secret is not valid",
        status: 400
    });

    const file = req.body.file as string;
    const fileName = req.body.fileName as string;
    const fileType = req.body.fileType as file_type;
    const fileDuration = req.body.fileSize as number;

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
    });

    const newFile = await db.workflow_file.create({
        data: {
            file_name : fileName,
            file,
            file_type : fileType,
            file_duration : fileDuration,
            workflow: {
                connect: {
                    uuid: workflowUuid
                }
            },
        }
    });

    res.status(200).json(newFile);


});

export default fileApi.handler;