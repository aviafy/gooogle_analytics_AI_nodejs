import {
  facebookAxiosGetUser,
  facebookAxiosPostMessage,
} from "../apis/facebookAxios.js";

export function facebookMsgSender(
  senderPsid,
  messageText,
  fb_page_access_token
) {
  const requestBody = {
    recipient: {
      id: senderPsid,
    },
    message: {
      text: messageText,
    },
  };

  facebookAxiosPostMessage(requestBody, fb_page_access_token);
}

export function getCustomerFbInfo(sender_psid, fields, access_token) {
  // console.log(sender_psid, "sender_psid");
  const params = {
    fields,
    access_token,
  };

  const result = facebookAxiosGetUser(params, sender_psid);
  return result;
}

export function callTypingAPI(sender_psid, action, fb_page_access_token) {
  const requestBody = {
    recipient: { id: sender_psid },
    sender_action: action, // Use 'typing_on', 'typing_off', or 'mark_seen'
  };

  facebookAxiosPostMessage(requestBody, fb_page_access_token, action);
}
