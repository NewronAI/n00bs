import NextExpress from "@/helpers/node/NextExpress";
import {NextApiRequest, NextApiResponse} from "next";
import {db} from "@/helpers/node/db";
import assertUp from "@/helpers/node/assert/assertUp";
import getLogger from "@/helpers/node/getLogger";
import {member_role, obj_status} from "@prisma/client";
import {getSession} from "@auth0/nextjs-auth0";

export const config = {
    api: {
      responseLimit: false,
    },
  }

const memberApi = new NextExpress();

memberApi.get(async (req: NextApiRequest, res: NextApiResponse) => {


    let {
        offset = null,
        limit = null,
        state = null,
        district = null,
        name = null,
    } = req.query;

    let offsetNum = offset ? parseInt(offset as string) : undefined;
    let limitNum = limit ? parseInt(limit as string) : undefined;

    let stateStr = state ? state as string : undefined;
    let districtStr = district ? district as string : undefined;
    let nameStr = name ? name as string : undefined;


    stateStr = stateStr?.trim();
    districtStr = districtStr?.trim();
    nameStr = nameStr?.trim();


    const members = await db.member.findMany({
        where: {
            name: typeof nameStr === "string" ? {
                contains: nameStr,
                mode: "insensitive"
            } : undefined,
            state: typeof stateStr === "string" ? {
                contains: stateStr,
                mode: "insensitive"
            } : undefined,
            district: typeof districtStr === "string" ? {
                contains: districtStr,
                mode: "insensitive"
            } : undefined,
            status : {
                not : obj_status.deleted
            }
        },
        include: {
            added_by_member: true
        },
        skip: offsetNum,
        take: limitNum,
        orderBy: {
            createdAt: "desc"
        }
    });

    res.status(200).json(members);

})

type MemberCreateBody = {
    name: string,
    email: string,
    phone: string,
    district: string,
    state: string,
    role: member_role,
    address: string,
    pincode: string,
    status: obj_status,
    payment_details: string

}

memberApi.post(async (req: NextApiRequest, res : NextApiResponse) => {

    let {
        name,
        email,
        phone,
        district,
        state,
        role,
        address,
        pincode,
        status,
        payment_details
    } = req.body as MemberCreateBody;

    const logger = getLogger("api/v1/member");

    const session = await getSession(req, res);
    if (!session) {
        res.status(401).json({message: "Unauthorized"});
        return;
    }

    const adderEmail = session.user.email;

    role = role as string as member_role;
    role = role || member_role.freelancer;

    assertUp(name, {
        message: "Name is required",
        status: 400
    });

    assertUp(email, {
        message: "Email is required",
        status: 400
    });

    assertUp(phone, {
        message: "Phone is required",
        status: 400
    });

    logger.debug("Creating member");

    name = name?.trim();
    email = email?.trim();
    phone = phone?.trim();
    district = district?.trim();
    state = state?.trim();
    address = address?.trim();
    pincode = pincode?.trim();
    payment_details = payment_details?.trim();

    const member = await db.member.create({
        data: {
            name,
            email,
            phone,
            role,
            district,
            state,
            address,
            pincode,
            status,
            payment_details,
            added_by_member: {
                connect: {
                    email: adderEmail
                }
            }
        }
    })

    res.status(200).json(member);

})

type MemberUpdateBody = {
    uuid: string,
    name?: string,
    email?: string,
    phone?: string,
    district?: string,
    state?: string,
    role?: member_role,
    address?: string,
    pincode?: string,
    status?: obj_status,
    payment_details?: string

}

memberApi.put(async (req: NextApiRequest, res: NextApiResponse) => {

    let {
        uuid,
        name,
        email,
        phone,
        district,
        state,
        role,
        address,
        pincode,
        status,
        payment_details
    } = req.body;

    const logger = getLogger("api/v1/member");

    assertUp(uuid, {
        message: "body: uuid is required",
        status: 400
    });

    uuid = uuid?.trim();
    email = email?.trim();
    phone = phone?.trim();

    logger.debug("Updating member");

    const member = await db.member.update({
        data: {
            name,
            email,
            phone,
            role,
            district,
            state,
            address,
            pincode,
            status,
            payment_details
        },
        where: {
            uuid : uuid
        }
    });

    res.status(200).json(member);

})

export default memberApi.handler;