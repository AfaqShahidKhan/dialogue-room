import { Router } from "express";
import { sendFriendRequestSchema } from "@dialogue-room/shared";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/authenticate";
import * as friendshipController from "../controllers/friendship.controller";

export const friendshipRouter = Router();

friendshipRouter.use(authenticate);

// Static/specific routes before dynamic /:id to avoid path collisions.
friendshipRouter.get("/friends", friendshipController.listFriends);
friendshipRouter.get("/requests/incoming", friendshipController.listIncomingRequests);
friendshipRouter.get("/requests/outgoing", friendshipController.listOutgoingRequests);

friendshipRouter.post("/", validate(sendFriendRequestSchema), friendshipController.sendFriendRequest);
friendshipRouter.patch("/:id/accept", friendshipController.acceptFriendRequest);
friendshipRouter.patch("/:id/decline", friendshipController.declineFriendRequest);
friendshipRouter.delete("/with/:userId", friendshipController.unfriend);
friendshipRouter.delete("/:id", friendshipController.cancelFriendRequest);
