import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";
import assertUp from "@/helpers/node/assert/assertUp";

const unassignedFilesApi = new NextExpress();

unassignedFilesApi.get(async (req, res) => {

    const workflowUUID = req.query.workflowUuid as string;

    const workflow = await db.workflow.findFirst({
        where: {
            uuid: workflowUUID
        },
        include: {
            tasks: true
        }
    });

    assertUp(workflow, {
        status: 404,
        message: "Workflow not found"
    });

    const taskCounts = new Map<number, number>();
    workflow.tasks.forEach(task => {
        taskCounts.set(task.id, task.min_assignments);
    });

    const proc = await db.task_assignment.groupBy({
        by: ["workflow_file_id", "task_definition_id"],
        where: {
            workflow_file: {
                workflowId: workflow.id
            }
        },
        _count: {
            task_definition_id: true
        },
        orderBy: {
            workflow_file_id: "asc"
        },
    });

    const unassignedFileIds = new Set<number>();
    for(const p of proc) {
        if(p._count.task_definition_id < taskCounts.get(p.task_definition_id)!) {
            unassignedFileIds.add(p.workflow_file_id);
        }
    }

    const unassignedFileIdsArray = Array.from(unassignedFileIds);

    const unassignedFiles = await db.workflow_file.findMany({
        where: {
            id: {
                in: unassignedFileIdsArray
            }
        }
    })

    res.status(200).json(unassignedFiles);

});

export default unassignedFilesApi.handler;