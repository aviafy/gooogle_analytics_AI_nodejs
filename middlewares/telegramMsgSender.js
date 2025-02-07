import { telegramAxios } from "../apis/telegramAxios.js";

export function telegramMsgSender(chat_id, messageText) {
  return telegramAxios().get("sendMessage", {
    chat_id: "5997424107",
    text: messageText,
  });
}

export function sendToAdmin(messageText) {
  return telegramAxios().get("sendMessage", {
    chat_id: "5997424107",
    text: messageText,
  });
}
