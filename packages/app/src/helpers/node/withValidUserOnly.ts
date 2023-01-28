import {getSession, withApiAuthRequired} from "@auth0/nextjs-auth0";
import {member_role} from "@prisma/client";
import {NextApiRequest, NextApiResponse} from "next";
import {db} from "@/helpers/node/db";
import isValidAccess from "@/helpers/node/isValidAccess";


const withValidUserOnly = (handler : (req: NextApiRequest, res: NextApiResponse) => null, requiredAccess : member_role, strictRoleRequirement = false) => {
    const newHandler = async (req: NextApiRequest, res : NextApiResponse) => {

        try {
            const session = await getSession(req, res);

            if(!session){
                res.status(401).json({message: "Unauthorized"});
                return;
            }

            const {email} = session.user;

            const dbUser = await db.member.findUnique({
                where: {
                    email
                }
            });

            if(!dbUser){
                res.status(401).json({message: "Unauthorized"});
                return;
            }

            const role = dbUser.role;

            if(!isValidAccess(role, requiredAccess, strictRoleRequirement)){
                await handler(req, res);
            }
            else {
                res.status(403).json({message: "Insufficient access"});
            }


        }catch (e) {
            console.error(e);
            res.status(500).json({message: "Internal Server Error"});
        }

    }

    return  withApiAuthRequired(newHandler);
}

export default withValidUserOnly;