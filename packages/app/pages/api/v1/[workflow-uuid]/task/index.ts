import NextExpress from "@/helpers/node/NextExpress";

const taskApi = new NextExpress();

taskApi.get(async (req, res) => {
    // Get all tasks
    res.status(200).json({status: "ok"});

});

export default taskApi.handler;