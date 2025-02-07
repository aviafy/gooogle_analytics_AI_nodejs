import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

// Send a message via the Instagram Graph API with async/await
export async function instagramAxiosPostMessage(requestBody, access_token) {
  console.log(requestBody, access_token, "rame");
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v21.0/me/messages`,
      requestBody,
      {
        params: {
          access_token, // Passing access token as a parameter
        },
      }
    );

    // Log successful message sending
    // console.log("Message sent successfully", response.data);
    return response.data; // Return the response data in case it's needed
  } catch (err) {
    // Improved error handling
    if (err.response && err.response.data.error) {
      console.error("API response error:", err.response.data.error);
    } else {
      console.error("Unable to send message:", err.message);
    }

    // Optionally rethrow the error if you want to handle it outside
    throw new Error(err.response?.data?.error?.message || err.message);
  }
}

// Fetch Instagram user info via the Instagram Graph API
export async function instagramAxiosGetUser(params, instagramUserId) {
  // console.log(params, "params");
  try {
    // API call to get Instagram user info
    const response = await axios.get(
      `https://graph.facebook.com/v20.0/${instagramUserId}`,
      {
        params,
      }
    );

    // Log the Instagram user information
    console.log("Instagram User Information:", response.data);
    return response.data; // Returns the user information
  } catch (error) {
    console.log("Error fetching Instagram user information:", error);
  }
}
