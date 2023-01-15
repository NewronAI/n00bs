import NextExpress from "@/helpers/node/NextExpress";
import {NextApiRequest, NextApiResponse} from "next";
import {db} from "@/helpers/node/db";
import assertUp from "@/helpers/node/assert/assertUp";
import getLogger from "@/helpers/node/getLogger";
import {member_role} from "@prisma/client";

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
            } : undefined
        },
        skip: offsetNum,
        take: limitNum
    });

    res.status(200).json(members);

})

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
        payment_details
    } = req.body;

    const logger = getLogger("api/v1/member");

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

    console.log("hello");
    logger.debug("Creating member");
    logger.error(payment_details);

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
            payment_details
        }
    })

    res.status(200).json(member);

})

export default memberApi.handler;