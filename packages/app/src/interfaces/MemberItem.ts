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
    added_by_member?: MemberItem;
}

export default MemberItem;