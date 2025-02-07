import { getCompanyByFb } from "../utils/db/company.handlers.js";
import {
  callTypingAPI,
  facebookMsgSender,
  getCustomerFbInfo,
} from "../middlewares/facebookMsgSender.js";
import {
  createNewCustomer,
  changeCustomerInfo,
  getCustomer,
  addNewMessage,
  createNewCustomerFromFb,
} from "../utils/db/customer.handlers.js";

export async function handlerManualFbSend(req, res) {
  console.log(req.body, "body");
  try {
    const { page, chat, message } = req.body;

    let role = "user";
    const customer = await getCustomer(chat);
    console.log(customer, "customer");
    if (customer) {
      const updatedCustomer = await addNewMessage(customer, message, role);

      if (updatedCustomer) {
        res.status(200).send("MESSAGE_SENT");
        return facebookMsgSender(chat, message, page);
      }
    }
  } catch (error) {
    console.error("Error in send manual message", error);
    res.status(500).send("Error in send manual message");
  }
}

export async function sendMessageToAdmin(req, res) {
  console.log(req.body, "body");
  try {
    const { message } = req.body;

    let page =
      "EAASOME8USU8BO0q8M4sQWMbPQKUVp0AD7zXcViYYlAkICs4bgATTT2F8Ci0xfOv2eUtY2e0qJOwHXinUiv05WkRI2Yt1cuivahFJpgRae81sMakaX4WLRI89kbmM8EPQeSjBnKWhjvbbZCuNWjaxQfHSAVGLdDI1PiFpaKW2IJgS4AjrwdCCdA4ICWI4YGEE9yn3lA0zK1qhBBAZDZD";
    let chat = "8579480088802848";

    res.status(200).send("MESSAGE_SENT");
    return facebookMsgSender(chat, message, page);
  } catch (error) {
    console.error("Error in send manual message", error);
    res.status(500).send("Error in send manual message");
  }
}
