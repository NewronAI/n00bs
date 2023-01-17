import {sha256} from "crypto-hash";

const salt = process.env.PUBLIC_API_SALT || "salty";
async function getPublicWorkflowAPISecret(str: string): Promise<string> {
  return await sha256(`${str}/${salt}`);
}

export default getPublicWorkflowAPISecret;