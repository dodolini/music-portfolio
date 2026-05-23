import { Router } from "express";
import { login, secure, logout } from "../controllers/auth.controller";
import { authenticateToken } from "../auth";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.get("/secure", authenticateToken, secure);
authRouter.post("/logout", logout)

export default authRouter;
