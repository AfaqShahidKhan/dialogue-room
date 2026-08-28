import { Router } from "express";
import { userDiscoveryQuerySchema } from "@dialogue-room/shared";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/authenticate";
import { uploadUserPhoto } from "../middlewares/upload";
import * as userController from "../controllers/user.controller";

export const userRouter = Router();

userRouter.use(authenticate);

userRouter.get("/", validate(userDiscoveryQuerySchema, "query"), userController.discoverUsers);
userRouter.get("/me", userController.getMe);
userRouter.patch(
  "/me",
  uploadUserPhoto,
  userController.coerceMultipartProfileFields,
  userController.updateMe,
);
userRouter.get("/:id", userController.getPublicProfile);
