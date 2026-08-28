import { Router } from "express";
import { authRouter } from "./auth.routes";
import { userRouter } from "./user.routes";
import { friendshipRouter } from "./friendship.routes";
import { conversationRouter } from "./conversation.routes";

// Module routers register themselves here. Keep this file as the single
// mounting point so app.ts never changes when a module is added.
export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/friendships", friendshipRouter);
apiRouter.use("/conversations", conversationRouter);
