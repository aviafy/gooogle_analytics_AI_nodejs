import { Router } from "express";
import * as telegramOperatorBotControllers from "../controllers/telegramOperatorBot.controllers.js";
import * as facebookOperatorBotControllers from "../controllers/facebookOperatorBot.controllers.js";
import * as facebookManualOperatorControllers from "../controllers/facebookManualOperator.controllers.js";

const router = Router();

router.route("/facebook").post(facebookOperatorBotControllers.handlerFacebook);
router.route("/telegram").post(telegramOperatorBotControllers.handlerTelegram);
router
  .route("/message-to-admin")
  .post(facebookManualOperatorControllers.sendMessageToAdmin);
router
  .route("/manual-facebook")
  .post(facebookManualOperatorControllers.handlerManualFbSend);

export default router;
