import NextExpress from "@/helpers/node/NextExpress";
import {db} from "@/helpers/node/db";
import {
    getAssignedFilesCount,
    getAssignedJobsCount, getCompletedFilesCount, getCompletedJobsCount,
    getFilesCount,
    getPendingJobsCount
} from "@/helpers/node/worflowStats";

export const config = {
    api: {
      responseLimit: false,
    },
  }

const slicedReportAPI = new NextExpress();

slicedReportAPI.get(async (req, res) => {

    const vendor = req.query.vendor as string | undefined;

    const workflows = await db.workflow.findMany({
        select: {
            tasks: {
                select: {
                    id: true,
                }
            },
            id: true,
            name: true,
            desc: true,
            uuid: true,
            status: true,
        },
        orderBy: {
            id : "asc"
        }
    });

    const promises = workflows.map(async (workflow) => {

        let id = workflow.id;
        let uuid = workflow.uuid;

        const filesCount = await getFilesCount(id,vendor);
        // const assignedFilesCount = await getAssignedFilesCount(uuid, vendor);
        const assignedTasksCount = await getAssignedJobsCount(id, vendor);
        const pendingTasksCount = await getPendingJobsCount(id, vendor);
        const completedTasksCount = await getCompletedJobsCount(id, vendor);
        const completedFilesCount = await getCompletedFilesCount(id, vendor);

        return {
            filesCount,
            // assignedFilesCount,
            assignedTasksCount,
            pendingTasksCount,
            completedTasksCount,
            completedFilesCount,
        }
    });

    const stats = await Promise.all(promises);

    res.status(200).json({
        workflows :
            workflows.map((workflow, index) => {
                const wfData : any = workflow;
                console.log(workflow);
                wfData.stats = stats[index];
                return wfData;
            })
    });

});


export default slicedReportAPI.handler;