import OpenAI from "openai";

const tools = [
  {
    type: "function",
    function: {
      name: "get_customer_full_name",
      description: "Ask customer's name if do not know it",
      parameters: {
        type: "object",
        properties: {
          full_name: {
            type: "string",
            description: "The name of the customer",
          },
        },
        additionalProperties: false,
        required: ["full_name"],
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "get_customer_info",
      description:
        "get customer name and phone number if is not this information in system",
      parameters: {
        type: "object",
        properties: {
          full_name: {
            type: "string",
            description: "The name of the customer",
          },
          phone_number: {
            type: "string",
            description:
              "The customer's phone number without the country code (e.g., 4567890).",
          },
        },
        additionalProperties: false,
        required: ["full_name", "phone_number"],
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "get_customer_phone_number",
      description: "For the customer, registration ask phone number",
      parameters: {
        type: "object",
        properties: {
          phone_number: {
            type: "string",
            description:
              "The customer's phone number without the country code (e.g., 4567890).",
          },
        },
        additionalProperties: false,
        required: ["phone_number"],
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "get_customer_full_name",
      description:
        "Ask customer's name for registration, if you do not know it",
      parameters: {
        type: "object",
        properties: {
          full_name: {
            type: "string",
            description: "The name of the customer.",
          },
        },
        additionalProperties: false,
        required: ["full_name"],
      },
      strict: true,
    },
  },
];

export async function createChatWithTools(
  messagesFromDb,
  system_instructions,
  openai_api_key,
  full_name,
  phone_number,
  tool_choice
) {
  const openai = new OpenAI({
    apiKey: openai_api_key,
  });
  let customer_info = `მომხმარებლის ტელეფონის ნომერი${phone_number.number}, მომხმარებლის სახელი არის${full_name}, სახელი შეგიძლია იმ ენაზე დაწერო რა ენაზეც საუბარი შედგება (მაგ: Alex - ალექს)`;
  let instructions = {
    role: "system",
    content: [
      {
        type: "text",
        text: `${system_instructions} ${full_name ? customer_info : ""}`,
      },
    ],
  };

  let messages = [instructions, ...messagesFromDb];
  // console.log(messages, "messages");

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      temperature: 0.28,
      max_completion_tokens: 204,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      tools: tools,
      tool_choice: tool_choice || "auto",
      parallel_tool_calls: true,
      response_format: {
        type: "text",
      },
    });

    if (response.choices[0].message.tool_calls) {
      const toolCall = response.choices[0].message.tool_calls[0];
      const argument = JSON.parse(toolCall.function.arguments);
      // console.log(argument, "arguments");
      return {
        assistant_message: null,
        phone_from_llm: argument.phone_number || null,
        name_from_llm: argument.full_name || null,
      };
    } else {
      const assistant_message = response.choices[0].message.content || "";
      return { assistant_message, phone_number: null, full_name: null };
    }
  } catch (error) {
    console.log("An error occurred:", error.message);
  }
}

// export async function createTextChat(messages) {
//   const openai = new OpenAI({
//     apiKey: openai_api_key,
//   });
//   const response = await openai.chat.completions.create({
//     model: "gpt-4o",
//     messages: [messages],
//     temperature: 1,
//     max_tokens: 2048,
//     top_p: 1,
//     frequency_penalty: 0,
//     presence_penalty: 0,
//     response_format: {
//       type: "text",
//     },
//   });
//   const assistant_message = response.choices[0].message.content;
//   return assistant_message;
// }

export async function imageInputLLM(openai_api_key, url) {
  const openai = new OpenAI({
    apiKey: openai_api_key,
  });
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "აღწერე სურათი, ტურის მდებარეობა, ფასი, დრო და რამდენ ადამიანზეა გათვლილი",
          },
          {
            type: "image_url",
            image_url: {
              url,
            },
          },
        ],
      },
    ],
  });

  console.log(response.choices[0].message, "response");

  const image_descr = response.choices[0].message.content;
  return image_descr;
}
