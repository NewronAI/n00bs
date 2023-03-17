import React from 'react';
import useSWR from 'swr';
import axios from 'axios';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import Head from "next/head";
import { member_role } from "@prisma/client";
import CreateUpdateQuestion from "@/components/CreateUpdateQuestion";
import QuestionItem from "@/interfaces/QuestionItem";


import Loader from '@/components/Loader';
import withAuthorizedPageAccess from "@/helpers/react/withAuthorizedPageAccess";

const questionFetcher = async (url: string) => {
    const res = await axios.get(url);
    return res.data;
}


const QuestionPage = () => {

    const { data: questions, error, mutate, isLoading } = useSWR<QuestionItem[]>('/api/v1/question', questionFetcher);
    console.log("data", questions)

    if (error) {
        console.log(error);
        return <div>Failed to load</div>
    }

    return (
        <DashboardLayout currentPage={"questions"} secondaryNav={<></>}>
            <Loader isLoading={isLoading}>
                <Head>
                    <title>Questions</title>
                </Head>

                <div className={"mt-2"}>
                    <div className={"p-0 md:pl-4"}>
                        <h1 className={"text-2xl font-bold"}>
                            Questions
                        </h1>
                        <p className={"font-thin text-sm"}>
                            All the questions asked to the members. You can also add new questions.
                        </p>
                    </div>

                    <CreateUpdateQuestion />
                    {
                        questions?.map((question, index) => (
                            <CreateUpdateQuestion question={question} key={index} mutate={mutate} questionNumber={index + 1} />
                        ))
                    }
                </div>
            </Loader>


        </DashboardLayout>
    );
};

QuestionPage.propTypes = {

};


export const getServerSideProps = withAuthorizedPageAccess({}, member_role.admin);

export default QuestionPage;