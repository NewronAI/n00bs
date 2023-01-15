import {member_role} from "@prisma/client";

interface MemberItem {
    uuid: string;
    name: string;
    email: string;
    role: member_role;
    district?: string;
    state?: string;
    address?: string;
    phone?: string;
    pincode?: string;
    status: string;
}

export default MemberItem;