import {handleAuth, handleLogin, handleLogout} from "@auth0/nextjs-auth0";
import {NextApiRequest, NextApiResponse} from "next";

export default handleAuth({
  async login(req : NextApiRequest, res: NextApiResponse) {
    await handleLogin(req, res, {
      returnTo: "/workflows",
      authorizationParams: {
        ...(req.query || {}),
        audience: process.env.AUTH0_AUDIENCE,
        scope: "openid email profile",

        //  Setup: Create a new scope for the API server in Auth0"
        //  Auth0 -> Application -> API -> Name: "anything" ->
        //  Security -> Scopes -> Add a new scope ->
        //  Name: "newron-server" -> Description: "anything"
      }
    });
  },
  async logout(req : NextApiRequest, res: NextApiResponse) {
    await handleLogout(req, res, {
      returnTo: "/",
    });
  },
});
