import {NextApiRequest, NextApiResponse} from "next";
import assertUp from "@/helpers/node/assert/assertUp";
import assertHandler from "@/helpers/node/assert/assertHandler";
import {db} from "@/helpers/node/db";

const signupHandler = async (req: NextApiRequest, res: NextApiResponse) => {

    const { method } = req;

    try {

        assertUp(method === "POST", {
            message : "Only POST requests are supported",
            status : 405
        });

        const { email, name, contact , address } = req.body;
        // Todo: Change email source to session

        const emailRegex = new RegExp(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/);

        assertUp(email && emailRegex.test(email), {
            message : "Email is required && must be valid",
            status : 400
        });

        assertUp(name && name.length < 100, {
            message : "Name is required and must be less than 100 characters",
            status : 400
        });

        if(contact) {
            const contactRegex = new RegExp(/^+?[0-9]{0-3}-?[0-9]{8-12}$/);

            assertUp(contact && contactRegex.test(contact), {
                message: "Contact is required and must be less than 100 characters",
                status: 400
            });
        }

        assertUp(address && address.length < 200, {
            message : "Address is required and must be less than 200 characters",
            status : 400
        });

        const user = db.workflow_manager.create({
            data: {
                email,
                name,
                phone: contact,
            }
        });


        res.status(200).json(user);


    }
    catch (e) {
        assertHandler(e, res);
        return;
    }
}

export default signupHandler;