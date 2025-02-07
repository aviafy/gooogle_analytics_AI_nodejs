import { createChatWithTools, imageInputLLM } from "../services/LLM.js";
import { getCompanyByFb } from "../utils/db/company.handlers.js";
import {
  telegramMsgSender,
  sendToAdmin,
} from "../middlewares/telegramMsgSender.js";
import {
  callTypingAPI,
  facebookMsgSender,
  getCustomerFbInfo,
} from "../middlewares/facebookMsgSender.js";
import {
  createNewCustomer,
  changeCustomerInfo,
  getCustomer,
  fetchUserConversation,
  fetchConversationMessages,
  addNewMessage,
  createNewCustomerFromFb,
} from "../utils/db/customer.handlers.js";
import moment from "moment";

// Utility function to create a delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function handleNewCustomer(company, newMessage, customer_info) {
  let company_id = company._id;
  try {
    const newCustomer = await createNewCustomerFromFb(
      company_id,
      customer_info
    );

    if (newCustomer) {
      await handleExistingCustomer(newCustomer, newMessage, company);
    }
  } catch (error) {
    console.error("Error creating new customer:", error);

    console.log("something went wrong while creating a new customer");
  }
}

async function handleExistingCustomer(customer, newMessage, company) {
  const { chat_id, full_name, gender, bot_suspended, phone_number } = customer;
  const {
    fb_page_access_token,
    system_instructions,
    openai_api_key,
    fb_chat_id,
  } = company;

  const text = newMessage;
  try {
    let role = "user";

    const conversation = await fetchUserConversation(
      fb_chat_id,
      chat_id,
      fb_page_access_token
    );
    const conversation_id = conversation.data[0].id;

    const messagesDataFromFb = await fetchConversationMessages(
      conversation_id,
      fb_page_access_token
    );
    const messagesFromFb = messagesDataFromFb.data.reverse();

    const formattedMessages = messagesFromFb.map((msg) => ({
      role: msg.from.id === fb_chat_id ? "assistant" : "user",
      content: msg.message,
    }));
    // console.log(formattedMessages, "conversation");

    if (bot_suspended) {
      return;
    }

    // Mark message as seen and typing action
    await callTypingAPI(chat_id, "mark_seen", fb_page_access_token);
    await callTypingAPI(chat_id, "typing_on", fb_page_access_token);

    let tool_choice = "auto";
    const assistant_resp = await createChatWithTools(
      formattedMessages,
      system_instructions,
      openai_api_key,
      full_name,
      phone_number,
      tool_choice
    );
    const { assistant_message, phone_from_llm, name_from_llm } = assistant_resp;

    // console.log(assistant_resp, "arg");

    if (assistant_message) {
      // Send the response message
      return facebookMsgSender(
        chat_id,
        assistant_message,
        fb_page_access_token
      );
    } else {
      let updatedCustomerInfo = await changeCustomerInfo(
        customer,
        phone_from_llm,
        name_from_llm
      );

      let tool_choice = "none";
      let assistant_resp = await createChatWithTools(
        formattedMessages,
        system_instructions,
        openai_api_key,
        full_name,
        phone_number,
        tool_choice
      );
      const { assistant_message } = assistant_resp;

      // Send the response message
      return facebookMsgSender(
        chat_id,
        assistant_message,
        fb_page_access_token
      );
    }
  } catch (error) {
    console.error("Error handling existing customer:", error);
  }
}

export async function handlerTelegram(req, res) {
  try {
    res.send("POST request handled");
    const { body } = req;
    const messageObj = body.message;
    const chat_id = messageObj.chat.id;
    const messageText = messageObj.text || "";
    console.log(body, "body");
    // Append the new message to the messageColector string
    messageColector += messageText;

    // Await the delay of 2000 milliseconds (2 seconds)
    // await delay(2000);

    // // Check if the messageColector has accumulated text
    // if (messageColector.length > 0) {
    //   const assistantResponse = await chatPreparation(
    //     messageColector,
    //     messageObj.chat.id
    //   );
    //   await telegramMsgSender(chat_id, assistantResponse);

    //   // Clear the messageColector after processing
    //   messageColector = "";
    // }
  } catch (error) {
    console.error("Error in Telegram handler:", error);
    res.status(500).send("Error handling Telegram request.");
  }
}

export async function handlerFacebook(req, res) {
  res.status(200).send("EVENT_RECEIVED");
  // console.log(req.body, "body");

  try {
    const { body } = req;

    if (body.object === "page" && body.entry && body.entry[0].messaging) {
      const webhookEvent = body.entry[0].messaging[0];
      console.log(webhookEvent, "webhook");

      const chat_id = webhookEvent.sender.id;
      const recipient_id = webhookEvent.recipient.id;
      let company = await getCompanyByFb(recipient_id);

      if (company) {
        const {
          fb_page_access_token,
          bot_active,
          openai_api_key,
          bot_active_interval,
        } = company;
        const { start_time, end_time, interval_active, timezone } =
          bot_active_interval;

        const getCurrentTimeInRegion = (region) => {
          const currentTime = new Date();
          const options = {
            timeZone: region,
            hour: "2-digit",
            minute: "2-digit",
            hour12: false, // Ensures 24-hour format
          };

          return new Intl.DateTimeFormat("en-US", options).format(currentTime);
        };
        const timeInRegione = moment(getCurrentTimeInRegion(timezone), "HH:mm");
        // console.log(getCurrentTimeInRegion(timezone), "current time");

        const start = moment(start_time, "HH:mm"); // Format of saved time
        const end = moment(end_time, "HH:mm"); // Format of saved time

        if (!bot_active) {
          console.log("Bot is not active. Stopping further actions.");
          return;
        }

        if (bot_active && interval_active) {
          // console.log("Current Time:", timeInRegione);
          // console.log("Start Time:", start);
          // console.log("End Time:", end);

          if (end.isBefore(start)) {
            // Handle intervals spanning midnight
            if (
              timeInRegione.isBetween(
                start,
                moment("23:59", "HH:mm"),
                null,
                "[]"
              ) ||
              timeInRegione.isBetween(moment("00:00", "HH:mm"), end, null, "[]")
            ) {
              console.log("Bot interval is active. Continue with actions.");
            } else {
              console.log(
                "Bot interval is not active. Stopping further actions1."
              );
              return;
            }
          } else {
            // Regular interval
            if (timeInRegione.isBetween(start, end, null, "[]")) {
              console.log("Bot interval is active. Continue with actions.");
            } else {
              console.log(
                "Bot interval is not active. Stopping further actions2."
              );
              return;
            }
          }
        }

        const fields = "first_name,last_name,profile_pic,locale";

        const newMessage = webhookEvent.message?.text || "";
        const newImage = webhookEvent.message?.attachments || "";
        // console.log(newMessage, "new message");
        try {
          const customer = await getCustomer(chat_id);

          if (newMessage) {
            if (!customer) {
              let customerInfo = await getCustomerFbInfo(
                chat_id,
                fields,
                fb_page_access_token
              );
              // console.log(customerInfo, "customer info");
              // Handle new customer
              await handleNewCustomer(
                company,
                newMessage,
                customerInfo || { id: chat_id }
              );
            } else {
              // Handle existing customer
              await handleExistingCustomer(customer, newMessage, company);
            }
          } else if (newImage) {
            let image_url = newImage[0].payload.url;
            let role = "user"; // Declare role here

            try {
              // Call imageInputLLM and await the result
              const image_descr = await imageInputLLM(
                openai_api_key,
                image_url
              );
              let full_descr = `მომხმარებელმა სურათი გამოგვიგზავნა რომლის აღწერაა:${image_descr}`;
              // Update the customer with the new image description
              const updatedCustomer = await addNewMessage(
                customer,
                full_descr,
                role,
                image_url
              );

              console.log(updatedCustomer, "updated customer");
            } catch (error) {
              console.error("Error processing image:", error);
            }
          } else {
            console.log("No new message or image content to process.");
          }
        } catch (err) {
          console.error("Error fetching user info or sending message:", err);
        }
      } else {
        // Handle case where company is not found
        sendToAdmin(`New user ID is ${recipient_id}`);
        console.log(`New user ID is ${recipient_id}`);
      }
    } else {
      res.status(404).send("Event not from a page subscription");
    }
  } catch (error) {
    console.error("Error in Facebook handler:", error);
    res.status(500).send("Error handling Facebook request.");
  }
}
