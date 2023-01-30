import {NextApiRequest, NextApiResponse} from "next";
import assertHandler from "@/helpers/node/assert/assertHandler";
import assertUp from "@/helpers/node/assert/assertUp";
import {withApiAuthRequired} from "@auth0/nextjs-auth0";

interface NextExpressConfig {
    onError?:  (error: any,req : NextApiRequest, res: NextApiResponse) => void;
    onNoMatch?: (req: NextApiRequest,res: NextApiResponse) => void;
    authenticatedRoute?: boolean;
}


interface MethodMap {
    [key: string]: ((req: NextApiRequest, res: NextApiResponse) => void) | undefined;
}

class NextExpress {
    protected onError?: (error: any,req : NextApiRequest, res: NextApiResponse) => void;
    protected onNoMatch?: (req: NextApiRequest,res: NextApiResponse) => void;

    protected getMethod? :  (req: NextApiRequest,res: NextApiResponse) => void;
    protected postMethod? :  (req: NextApiRequest,res: NextApiResponse) => void;
    protected putMethod? :  (req: NextApiRequest,res: NextApiResponse) => void;
    protected deleteMethod? :  (req: NextApiRequest,res: NextApiResponse) => void;

    private defaultErrorHandler = (error: any,_req : NextApiRequest, res: NextApiResponse) => {
        assertHandler(error, res);
    }
    private authenticatedRoute: boolean;

    private defaultNoMatchHandler = (_req: NextApiRequest,res: NextApiResponse) => {

        const allowedMethods = [];
        if(this.getMethod) allowedMethods.push("GET");
        if(this.postMethod) allowedMethods.push("POST");
        if(this.putMethod) allowedMethods.push("PUT");
        if(this.deleteMethod) allowedMethods.push("DELETE");

        res.status(405).json({message: "Method not allowed", allowed: allowedMethods});
    }

    constructor(config?: NextExpressConfig) {
        this.onError = config?.onError || this.defaultErrorHandler;
        this.onNoMatch = config?.onNoMatch || this.defaultNoMatchHandler;
        this.authenticatedRoute = config?.authenticatedRoute || false;
    }

    get =  (handler: (req: NextApiRequest, res: NextApiResponse) => void) => {
        this.getMethod = handler;
        return this;
    }

    post = (handler:  (req: NextApiRequest, res: NextApiResponse) => void) => {
        this.postMethod = handler;
        return this;
    }

    put =  (handler: (req: NextApiRequest, res: NextApiResponse) => void) => {
        this.putMethod = handler;
        return this;
    }

    delete =  (handler: (req: NextApiRequest, res: NextApiResponse) => void) => {
        this.deleteMethod = handler;
        return this;
    }

    handler =  async (req: NextApiRequest, res: NextApiResponse) => {
        const mapping : MethodMap = {
            GET: this.getMethod,
            POST: this.postMethod,
            PUT: this.putMethod,
            DELETE: this.deleteMethod,
        }
        try {

            const method = req.method as unknown as keyof MethodMap;

            console.log(method);

            assertUp(method, {message: "Method not available", status: 405});

            const handler = mapping[method] || this.onNoMatch;

            assertUp(handler, {message: "Method not available", status: 405});

            if(this.authenticatedRoute){
                withApiAuthRequired(handler);
            }
            else {
                await handler?.(req, res);
            }


        } catch (error) {
            this.onError?.(error, req, res);
        }
    }
}

export default NextExpress;