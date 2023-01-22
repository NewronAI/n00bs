import {file_type, obj_status} from "@prisma/client";

export default interface WorkflowFileItem {
    id: number;
    uuid: string;
    file_name: string;
    file: string;
    file_type: file_type;
    file_duration?: number;
    district?: string;
    state?: string;
    vendor?: string;
    metadata?: any;

    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;

    status: obj_status;
}