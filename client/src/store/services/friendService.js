import { apiRequest } from "@/utils/api";
import Cookies from "js-cookie";

export async function postFriendRequest(userId) {
  try {
    const endpoint = "/users/send-request";
    const body = { userId };

    const response = await apiRequest(endpoint, "POST", body);

    console.log("Friend request response: ", response);

    if (response.success) {
      return { success: true, message: "Friend request sent successfully!" };
    } else {
      return { success: false, message: response.message || "Failed to send friend request." };
    }
  } catch (error) {
    console.error("Error sending friend request:", error);
    return { success: false,message: error.message || "An error occurred while sending the friend request." };
  }
}
