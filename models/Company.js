import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema(
  {
    name: { type: String, required: false },
    email: { type: String, required: false, unique: true, index: true }, // Indexed and set to unique
    address: { type: String, required: false },
    registration_id: { type: String, required: false, index: true }, // Indexed for better query performance
    registration_name: { type: String, required: false },
    logo: { type: String, required: false },
    main_logo: { type: String },
    ring_logo: { type: String },
    invoice_logo: { type: String, required: false },
    invoice_logo_background: { type: String, required: false },
    web_page: { type: String, required: false },
    phone_number: {
      code: { type: String, default: "+995" },
      flag: { type: String, default: "ge" },
      number: { type: String, required: false, match: /^[0-9]{9}$/ }, // Pattern for 9-digit numbers
    },
    payment_methods: [
      {
        bank_name: { type: String, required: false },
        account_number: { type: String, required: false },
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    sections: {
      customers: Boolean,
      expenses: Boolean,
      investments: Boolean,
      invoices: Boolean,
      orders: Boolean,
      services: Boolean,
      statistics: Boolean,
    },
    //bot
    fb_chat_id: { type: String, required: false },
    insta_chat_id: { type: String, required: false },
    telegram_chat_id: { type: String, required: false },
    openai_api_key: { type: String, required: false },
    fb_page_access_token: { type: String, required: false },
    insta_page_access_token: { type: String, required: false },
    system_instructions: { type: String, require: false },
    bot_active: {
      type: Boolean,
      default: true,
    },
    bot_active_interval: {
      interval_active: { type: Boolean, default: false },
      timezone: { type: String, default: "Asia/Tbilisi" },
      start_time: { type: String, default: "00:00" },
      end_time: { type: String, default: "00:00" },
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt timestamps
  }
);

// Creating the model from the schema
export const Company = mongoose.model("Company", CompanySchema);
