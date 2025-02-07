import { createChatWithTools, imageInputLLM } from "../services/LLM.js";
import { getCompanyByTelegram } from "../utils/db/company.handlers.js";
import {
  telegramMsgSender,
  sendToAdmin,
} from "../middlewares/telegramMsgSender.js";
import {
  createNewCustomer,
  changeCustomerInfo,
  getCustomer,
  addNewMessage,
  createNewCustomerFromInstagram,
} from "../utils/db/customer.handlers.js";

// Utility function to create a delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function handleNewCustomer(company, newMessage, chat_id) {
  let company_id = company._id;
  try {
    const newCustomer = await createNewCustomerFromInstagram(
      company_id,
      chat_id
    );

    if (newCustomer) {
      await handleExistingCustomer(newCustomer, newMessage, company);
    }
  } catch (error) {
    console.error("Error creating new customer:", error);
  }
}

async function handleExistingCustomer(customer, newMessage, company) {
  const { chat_id, full_name, gender, bot_active } = customer;
  const { insta_page_access_token, system_instructions, openai_api_key } =
    company;

  const text = newMessage;
  try {
    let role = "user";

    const updatedCustomer = await addNewMessage(customer, text, role);
    const { messages } = updatedCustomer;

    if (!bot_active) {
      return;
    }
    const simplifiedMessages = messages.map(({ role, content }) => ({
      role,
      content,
    }));

    const assistant_resp = await createChatWithTools(
      simplifiedMessages,
      system_instructions,
      openai_api_key,
      full_name
    );
    const { assistant_message, phone_number } = assistant_resp;

    // console.log(assistant_resp, "arg");

    if (assistant_message) {
      role = "assistant";
      let finalCustomer = await addNewMessage(
        updatedCustomer,
        assistant_message,
        role
      );

      let lastMessage =
        finalCustomer.messages[finalCustomer.messages.length - 1].content;

      // Send the response message
    } else {
      let updatedCustomerInfo = await changeCustomerInfo(
        updatedCustomer,
        phone_number
      );

      let tool_choice = "none";
      let assistant_resp = await createChatWithTools(
        simplifiedMessages,
        system_instructions,
        openai_api_key,
        full_name,
        tool_choice
      );

      const { assistant_message } = assistant_resp;

      role = "assistant";
      let finalCustomer = await addNewMessage(
        updatedCustomer,
        assistant_message,
        role
      );

      let lastMessage =
        finalCustomer.messages[finalCustomer.messages.length - 1].content;

      // Send the response message
    }
  } catch (error) {
    console.error("Error handling existing customer:", error);
  }
}

export async function handlerTelegram(req, res) {
  try {
    const { body } = req;
    const { message } = body;
    const { chat, text } = message;
    const { id: chat_id } = chat;

    console.log(body, "body");

    // Delay for 2 seconds before processing
    // await delay(2000);
    const customer = await getCustomer(chat_id);
    if (customer) {
      await handleExistingCustomer(customer, text);
    } else {
      const company = await getCompanyByTelegram(chat_id);
      await handleNewCustomer(company, text, chat_id);
    }

    // Send immediate response to acknowledge receipt
    res.send("POST request handled");
  } catch (error) {
    console.error("Error in Telegram handler:", error);
    res.status(500).send("Error handling Telegram request.");
  }
}
