import {member_role} from "@prisma/client";

function isValidAccess(access: member_role, requiredAccess: member_role, strictRoleRequirement = false) {

    if(strictRoleRequirement){
        return access === requiredAccess;
    }

    switch (requiredAccess) {
        case "admin":
            return access === "admin";
        case "manager":
            return access === "admin" || access === "manager";
        case "associate":
            return access === "admin" || access === "manager" || access === "associate";
        case "freelancer":
            return access === "admin" || access === "manager" || access === "associate" || access === "freelancer";
        default:
            return false;
    }

}

export default isValidAccess;