import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const MY_TOKEN = process.env.MY_BOT_TOKEN;
const BASE_URL = `https://api.telegram.org/bot${MY_TOKEN}`;

export function telegramAxios() {
  return {
    get(method, params) {
      return axios.get(`${BASE_URL}/${method}`, { params });
    },
    post(method, data) {
      return axios.post(`${BASE_URL}/${method}`, data);
    },
  };
}
