import {NextApiRequest, NextApiResponse} from "next";
import assertUp from "@/helpers/node/assert/assertUp";
import assertHandler from "@/helpers/node/assert/assertHandler";
import {db} from "@/helpers/node/db";
import getLogger from "@/helpers/node/getLogger";

const signupHandler = async (req: NextApiRequest, res: NextApiResponse) => {

    const { method } = req;

    const logger = getLogger("api/v1/manager/signup.ts");
    logger.info("Received request");

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

        logger.info(`Creating manager account for ${email}`);

        assertUp(name && name.length < 100, {
            message : "Name is required and must be less than 100 characters",
            status : 400
        });

        logger.info(`Creating manager account for ${name}`);

        if(contact) {
            logger.info("Contact is provided");
            const contactRegex = new RegExp(/^\+?[0-9]{0,3}-?[0-9]{8,12}$/);

            assertUp(contact && contactRegex.test(contact), {
                message: "Contact is required and must be less than 100 characters",
                status: 400
            });
        }

        if(address) {
            assertUp(address && address.length < 200, {
                message: "Address is required and must be less than 200 characters",
                status: 400
            });
        }


        const user = await db.workflow_manager.create({
            data: {
                email,
                name,
                phone: contact,
            }
        });

        logger.debug(`Created manager account for ${email}`);

        res.status(200).json(user);


    }
    catch (e) {
        assertHandler(e, res);
        return;
    }
}

export default signupHandler;