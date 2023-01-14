import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";
import assertUp from "@/helpers/node/assert/assertUp";
import {file_type} from "@prisma/client";

const fileApi = new NextExpress();

fileApi.get(async (req, res) => {
    // Get all files

    const start = req.query.start as unknown as number || undefined;
    const offset = req.query.start as unknown as number || undefined;

    const files = await db.workflow_file.findMany({
        skip: start,
        take: offset
    });
    res.status(200).json(files);

});


fileApi.post(async (req, res) => {

    const workflowUuid = req.query?.["workflow-uuid"] as string;

    const file = req.body.file as string;
    const fileName = req.body.fileName as string;
    const fileType = req.body.fileType as file_type;

    assertUp(file, {
        message: "File: Param is required. Should contain the url of the file",
        status: 400
    });

    assertUp(fileName, {
        message: "File Name: Param is required. Should contain the name of the file",
        status: 400
    });

    assertUp(workflowUuid, {
        message: "Workflow UUID: Param is required. Should contain the uuid of the workflow",
        status: 400
    });

    assertUp(fileType, {
        message: "File Type: Param is required. Should contain the type of the file",
    });

    const newFile = await db.workflow_file.create({
        data: {
            file,
            file_name : fileName,
            file_type : fileType,
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