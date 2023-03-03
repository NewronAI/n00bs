import DashboardLayout from "@/components/layouts/DashboardLayout";
import FilesUploadSelector from "@/components/CSVUploadSelector";
import {useRouter} from "next/router";
import axios from "axios";
import intraCreateDataTransformer from "@/transformers/intraCreateDataTransformer";

const CreateNewIntraPair = () => {

    const router = useRouter();

    const onCancel = () => {
        router.push("/intra");
    }

    const onDatasetImported = async (d : any, fileName? : string) => {

        try {

            await axios.post("/api/v1/intra/jobs", {
                fileName,
                data: d
            });

            return {
                isCreating: false,
                message: "Successfully created new Intra Pair task",
                error: null
            }

        } catch (e) {
            console.log(e);
            return {
                // @ts-ignore
                error: e.response ? e.response?.data?.message : e?.message || "Unknown error",
                isCreating: false,
                message: "Failed to create new Intra Pair task",
            }

        }


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
                        <FilesUploadSelector onCancel={onCancel}
                                              onDatasetImported={onDatasetImported}
                                              transformHeader={intraCreateDataTransformer}
                                              requiredFields={["file_name", "cosine_similarity", "is_reference", "file"]}/>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default CreateNewIntraPair;