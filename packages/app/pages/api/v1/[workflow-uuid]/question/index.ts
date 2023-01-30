import NextExpress from "@/helpers/node/NextExpress";

const questionWorkflowApi = new NextExpress();

questionWorkflowApi.get(async (req, res) => {
    //     get list of questions in the workflow
})

questionWorkflowApi.post(async (req, res) => {
    //     add a new question in the workflow
})

questionWorkflowApi.delete(async (req, res) => {
    //     delete a question in the workflow

});

export default questionWorkflowApi.handler;
