import express from "express";
import bodyParser from "body-parser";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
dotenv.config();
import operatorRoute from "./routes/operatorBot.routes.js";
connectDB();

const PORT = process.env.PORT || 5000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const MY_BOT_TOKEN = process.env.MY_BOT_TOKEN;

// Initialize Express app
const app = express();
app.use(bodyParser.json());
app.use("/chat", operatorRoute);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// Webhook Verification
app.get("/chat/facebook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// app.get("/chat/telegram", (req, res) => {
//   console.log(req.query);
//   const token = req.query.token;
//   const challenge = req.query.challenge;

//   if (token && token === MY_BOT_TOKEN) {
//     console.log("TELEGRAM_WEBHOOK_VERIFIED");
//     // Optionally, echo the challenge back if provided, or return a confirmation message
//     res.status(200).send(challenge || "TELEGRAM_WEBHOOK_VERIFIED");
//   } else {
//     res.sendStatus(403);
//   }
// });
