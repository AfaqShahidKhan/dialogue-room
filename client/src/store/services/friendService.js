import { apiRequest } from "@/utils/api";
import Cookies from "js-cookie";

export async function postFriendRequest(userId) {
  try {
    const endpoint = "/users/send-request";
    const body = { userId };

    const response = await apiRequest(endpoint, "POST", body);

    if (response.success) {
      return { success: true, message: "Friend request sent successfully!" };
    } else {
      return {
        success: false,
        message: response.message || "Failed to send friend request.",
      };
    }
  } catch (error) {
    console.error("Error sending friend request:", error);
    return {
      success: false,
      message:
        error.message || "An error occurred while sending the friend request.",
    };
  }
}

export async function fetchFriends() {
  try {
    const response = await apiRequest("/users/friends", "GET");
    return response.data.friends;
  } catch (error) {
    console.error("Error fetching friends:", error);
    return [];
  }
}

export async function fetchFriendRequests() {
  try {
    let response = await apiRequest("/users/pending-requests");    
    return response.data.pendingRequests;
  } catch (error) {
    console.error("Error fetching pending requests:", error);
  }
}

// Accept a friend request
export async function acceptFriendRequest(requestId) {
  try {
    const response = await apiRequest("/users/accept-request", "POST", {
      requestId,
    });
    return response.data;
  } catch (error) {
    console.error("Error accepting friend request:", error);
    return { success: false, message: "Failed to accept request" };
  }
}

// Cancel a friend request
export async function cancelFriendRequest(requestId) {
  try {
    const response = await apiRequest("/users/cancel-request", "POST", {
      requestId,
    });
    return response.data;
  } catch (error) {
    console.error("Error canceling friend request:", error);
    return { success: false, message: "Failed to cancel request" };
  }
}

// Unfriend a user
export async function unfriend(userId) {
  try {
    const response = await apiRequest("/users/unfriend", "POST", {
      friendId: userId,
    });
    return response.data;
  } catch (error) {
    console.error("Error unfriending user:", error);
    return { success: false, message: "Failed to unfriend user" };
  }
}
