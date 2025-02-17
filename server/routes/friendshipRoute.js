const express = require("express");
const friendshipController = require("../controllers/friendshipController");
const authController = require("../controllers/authController");

const router = express.Router();

// Protect all friendship routes
router.use(authController.protected);

router.post("/send-request", friendshipController.sendFriendRequest);
router.post("/accept-request", friendshipController.acceptFriendRequest);
router.post("/cancel-request", friendshipController.cancelFriendRequest); 
router.post("/unfriend", friendshipController.unfriend); 
router.get("/friends", friendshipController.getUserFriends);

module.exports = router;
