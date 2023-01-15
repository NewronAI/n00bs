import {obj_status, question_type} from "@prisma/client";

export default interface QuestionItem {
    uuid?: string;
    name: string;
    question_type: question_type;
    options: string[];
    status?: obj_status;
    order: number;
    text: string;
    required: boolean;
}