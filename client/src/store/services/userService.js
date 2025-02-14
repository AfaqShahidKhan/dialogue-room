import { apiRequest } from "@/utils/api";
import Cookies from "js-cookie";

export async function updateUserData(userData) {  
  try {
    let user = await apiRequest(`/users/updateMe`, "PATCH", userData);
    user = user.data.user;
    console.log("i am here and updated user is ", user);
    Cookies.remove('user')
    Cookies.set("user", JSON.stringify(user), { expires: 7 });


    return { success: true, user };
  } catch (error) {
    console.error("Failed to reset password:", error);
    throw error;
  }
}

export async function fetchAllUsers(queryString) {
  try {
    const endpoint = `/users?${queryString}`;
    console.log("url is---", endpoint);

    // Use apiRequest to fetch users
    let data = await apiRequest(endpoint, "GET");

    return { success: true, users: data.data };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, users: [] };
  }
}
