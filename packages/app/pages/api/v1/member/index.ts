import NextExpress from "@/helpers/node/NextExpress";
import {NextApiRequest, NextApiResponse} from "next";
import {db} from "@/helpers/node/db";
import assertUp from "@/helpers/node/assert/assertUp";

const memberApi = new NextExpress();

memberApi.get(async (req: NextApiRequest, res: NextApiResponse) => {

    const members = await db.member.findMany();

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