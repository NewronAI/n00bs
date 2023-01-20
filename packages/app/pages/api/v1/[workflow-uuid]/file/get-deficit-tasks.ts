import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";

const getDeficitTasksApi = new NextExpress();

getDeficitTasksApi.get(async (req, res) => {
    const fileUUID = req.query.fileUUID as string;

    console.log(fileUUID);

    const file = await db.$queryRaw`SELECT  workflow_file.id, count(task.id), task.min_assignments FROM workflow_file
    LEFT JOIN task_assignment ON task_assignment.id = workflow_file.id
    INNER JOIN task ON task_assignment.task_definition_id = task.id
    GROUP BY workflow_file.id, task.id ORDER BY workflow_file.id ASC;
    `;

    res.status(200).json(file);

});

export default getDeficitTasksApi.handler;