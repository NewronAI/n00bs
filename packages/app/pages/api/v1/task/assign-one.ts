import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";
import assertUp from "@/helpers/node/assert/assertUp";
import getLogger from "@/helpers/node/getLogger";

const assignOneTaskApi = new NextExpress();


assignOneTaskApi.post(async (req, res) => {

    // const workflowUUID = req.query["workflow-uuid"] as string;
    // not required rn later can be used for verification

    const workflowFileUUID = req.query["workflow-file-uuid"] as string;

    const logger = getLogger(`/pages/api/v1/task/assign-one`);

    const taskUUID = req.query["task-uuid"] as string;
    const assigneeUUID = req.query["assignee-uuid"] as string;

    assertUp(taskUUID, {
        status: 400,
        message: "workflow-uuid: Param is required. Should contain the uuid of the task"
    });

    assertUp(assigneeUUID, {
        status: 400,
        message: "assignee-uuid: Param is required. Should contain the uuid of the assignee"
    });

    assertUp(workflowFileUUID, {
        status: 400,
        message: "workflow-file-uuid: Param is required. Should contain the uuid of the workflow file"
    });

    logger.debug(`taskUUID : ${taskUUID} , assignee-uuid : ${assigneeUUID}, workflowFileUUID : ${workflowFileUUID}`);

    const task = await db.task.findFirstOrThrow({
        where: {
            uuid: taskUUID
        }
    });

    logger.debug(`task found : ${task.name} ${task}`);

    const assignee = await db.member.findFirstOrThrow({
        where: {
            uuid: assigneeUUID
        }
    });

    logger.debug(`assignee found : ${assignee.name} ${assignee.uuid}`);

    const workflowFile = await db.workflow_file.findFirstOrThrow({
        where: {
            uuid: workflowFileUUID
        }
    });

    logger.debug(`workflow-file : ${workflowFile.file} `);


    const status = await db.task_assignment.create({
        data: {
            name: "New Task",
            task_id: task.id,
            assignee_id: assignee.id,
            workflow_file_id: workflowFile.id
        }
    });

    res.status(200).json(status);

});

export default assignOneTaskApi.handler;