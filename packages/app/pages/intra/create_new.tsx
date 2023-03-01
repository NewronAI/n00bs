import DashboardLayout from "@/components/layouts/DashboardLayout";
import FilesUploadSelector from "@/components/CSVUploadSelector";
import {useRouter} from "next/router";
import {data} from "autoprefixer";

const CreateNewIntraPair = () => {

    const router = useRouter();

    const onCancel = () => {
        router.push("/intra");
    }

    const onDatasetImported = (d : any) => {

    }

    return (
        <DashboardLayout currentPage={"intra check"} secondaryNav={<></>}>

            <div>
                <div className={"pl-4"}>
                    <h1 className={"text-xl font-semibold"}>
                        Create New Intra Pair Task
                    </h1>
                    <p>
                        Create a new Intra Pair task by uploading a CSV file.
                    </p>
                </div>

                <div className={"flex justify-center"}>
                    <div className={" w-full"}>
                        <FilesUploadSelector  onCancel={onCancel}
                                              onDatasetImported={onDatasetImported}
                                              requiredFields={["Audio 2", "Cosine similarity", "Reference sample", "Audio link"]}/>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default CreateNewIntraPair;