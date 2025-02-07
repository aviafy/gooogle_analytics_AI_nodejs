import { Customer } from "../../models/Customer.js";
import { facebookApiGet } from "../../apis/facebookAxios.js";

export async function getCustomer(chat_id) {
  try {
    const customer = await Customer.findOne({ chat_id });
    return customer;
  } catch (error) {
    console.error("Error fetching customer:", error);
    return false;
  }
}

export async function addNewMessage(customer, message, role, image_url) {
  const { chat_id, messages } = customer;
  try {
    const filter = { chat_id };
    const newMessage = {
      role,
      content: message,
      image_url: image_url || "",
    };

    const updatedMessages = [...messages, newMessage];
    const updatedCustomer = await Customer.findOneAndUpdate(
      filter,
      { messages: updatedMessages },
      { new: true, runValidators: true }
    );

    return updatedCustomer;
  } catch (error) {
    console.error("Error adding new message:", error);
    return false;
  }
}

export async function changeCustomerInfo(customer, phone_number, full_name) {
  const { chat_id } = customer;
  console.log(phone_number, full_name, "finale");
  try {
    const filter = { chat_id };
    const updateFields = {};

    // Only update full_name if it's provided
    if (full_name) {
      updateFields.full_name = full_name;
    }

    // Only update phone_number if it's provided
    if (phone_number) {
      updateFields.phone_number = {
        code: "+995",
        flag: "ge",
        number: phone_number,
      };
    }

    // Perform the update using findOneAndUpdate with conditions
    const updatedCustomer = await Customer.findOneAndUpdate(
      filter,
      { $set: updateFields }, // Using $set to avoid overwriting entire fields
      {
        new: true, // Return the updated document
        runValidators: true, // Ensure Mongoose validation is applied
      }
    );

    return updatedCustomer;
  } catch (error) {
    console.error("Error updating customer:", error);
    return false;
  }
}

export async function createNewCustomer(chat_id, company_id) {
  try {
    // Check if either chat_id already exists
    const existingChat = await Customer.findOne({ chat_id });

    // Proceed to create a new customer only if both are not found or are empty
    if (!existingChat && !existingThread) {
      const customer = new Customer({
        company_id,
        operator_id: "66e2381a9f82da4fd0a0b74a",
        chat_id,
      });

      await customer.save();

      return customer;
    } else {
      console.log(
        "Customer with the same chat_id or threads_id already exists."
      );
      return null; // Return null if customer already exists
    }
  } catch (error) {
    console.error("Error creating new customer:", error);
    return false;
  }
}

export async function createNewCustomerFromFb(company_id, customer_info) {
  let {
    id,
    name,
    first_name,
    last_name,
    profile_pic,
    gender,
    locale,
    timezone,
  } = customer_info;
  try {
    // Check if either chat_id already exists
    const existingChat = await Customer.findOne({ id });

    // Proceed to create a new customer only if both are not found or are empty
    if (!existingChat) {
      const customer = new Customer({
        company_id,
        full_name: first_name + "" + last_name || "",
        profile_pic: profile_pic || "",
        gender: gender || "",
        locale: locale || "",
        timezone: timezone?.toString() || "",
        WDYAHAU: "fb",
        operator_id: "66e2381a9f82da4fd0a0b74a",
        chat_id: id,
      });

      await customer.save();

      return customer;
    } else {
      console.log("Customer with the same chat_id  already exists.");
      return null; // Return null if customer already exists
    }
  } catch (error) {
    console.error("Error creating new customer:", error);
    return false;
  }
}

export async function createNewCustomerFromInstagram(company_id, chat_id) {
  try {
    // Check if either chat_id already exists
    const existingChat = await Customer.findOne({ chat_id });

    console.log(existingChat, "validation");

    // Proceed to create a new customer only if both are not found or are empty
    if (!existingChat) {
      const customer = new Customer({
        company_id,
        WDYAHAU: "instagram",
        operator_id: "66e2381a9f82da4fd0a0b74a",
        chat_id: chat_id,
      });

      await customer.save();

      return customer;
    } else {
      console.log(
        "Customer with the same chat_id or threads_id already exists."
      );
      return null; // Return null if customer already exists
    }
  } catch (error) {
    console.error("Error creating new customer:", error);
    return false;
  }
}

export async function editCustomer(threads_id, newDetails, company_id) {
  // Combine outputs from newDetails into a single object
  const combinedOutputs = {};

  try {
    // Parse and combine details from newDetails array
    newDetails.forEach((item) => {
      const parsedOutput = JSON.parse(item.output);
      Object.assign(combinedOutputs, parsedOutput);
    });

    const { phone_number, full_name } = combinedOutputs;

    // Check for existing customer records based on phone number or threads_id
    const existingChat = await Customer.findOne({
      "phone_number.number": phone_number,
    });
    const existingThread = await Customer.findOne({ threads_id });

    // Proceed to update if either the phone number or threads_id exists
    if (existingChat || existingThread) {
      // Update the customer record with new details
      const updatedCustomer = await Customer.findOneAndUpdate(
        { threads_id },
        {
          company_id: company_id,
          operator_id: "66e2381a9f82da4fd0a0b74a",
          full_name,
          "phone_number.number": phone_number, // Correct syntax for nested fields
        },
        { new: true, runValidators: true } // Return the updated document and run validators
      );

      if (!updatedCustomer) {
        console.log("Customer not found for the given threads_id.");
        return null; // Return null if the customer wasn't found
      }

      return updatedCustomer; // Return the updated customer document
    } else {
      console.log(
        "No customer found with the provided phone number or threads_id."
      );
      return null; // Return null if neither record exists
    }
  } catch (error) {
    console.log("Error updating customer:", error); // Log the error for debugging
    return false; // Return false in case of any errors
  }
}

export async function fetchUserConversation(
  page_id,
  user_id,
  fb_page_access_token,
  fields = "id,participants"
) {
  try {
    const url = `v21.0/${page_id}/conversations`;
    const params = {
      fields: fields,
      user_id: user_id,
      access_token: fb_page_access_token,
    };

    const conversation = await facebookApiGet(url, params);
    return conversation;
  } catch (error) {
    console.error("Error fetching user's conversation:", error);
    throw error;
  }
}

// This function fetches message from a conversation.
export async function fetchConversationMessages(
  conversation_id,
  fb_page_access_token,
  fields = "id,created_time,message,from,to",
  limit = 30
) {
  try {
    const url = `v21.0/${conversation_id}/messages`;
    const params = {
      fields: fields,
      access_token: fb_page_access_token,
      limit: limit,
    };

    const messages = await facebookApiGet(url, params);
    return messages;
  } catch (error) {
    console.error("Error fetching conversation messages:", error);
    throw error;
  }
}
