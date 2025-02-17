import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiRequest(
  endpoint,
  method = "GET",
  data = null,
  headers = {}
) {
  try {
    const token = Cookies.get("token");

    // Default headers (only set JSON if data is not FormData)
    const defaultHeaders = {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(data instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...headers,
    };

    // const options = {
    //   method,
    //   headers: defaultHeaders,
    //   body: data instanceof FormData ? data : JSON.stringify(data),
    // };
    const options = {
      method,
      headers: defaultHeaders,
      ...(method !== "GET" && { body: data instanceof FormData ? data : JSON.stringify(data) }),
    };
    

    const url = `${API_URL}${endpoint}`;
    const response = await fetch(url, options);
    console.log("this is response", response);

    if (!response.ok) {
      const errorDetails = await response.json();
      throw new Error(errorDetails.message || `Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API Request Error:", error.message);
    throw error;
  }
}
