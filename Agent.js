import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createToolCallingAgent } from "langchain/agents";
import { AgentExecutor } from "langchain/agents";
import dotenv from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
import { momentTool, retrieveMomentTool } from "./Tools.js";
import chatModel from "./Models/chat.model.js";
import dayjs from "dayjs";

// Initialize dotenv to load environment variables
dotenv.config();

export async function GET(req) {
  try {
    const tools = [momentTool, retrieveMomentTool];

    const llm = new ChatOpenAI({
      modelName: "gpt-4o",
      temperature: 1,
      maxTokens: 1000,
    });

    // Retrieve chat history from the database
    const chatHistory = await chatModel.findOne({
      createdAt: {
        $gte: dayjs().startOf("day").toDate(),
        $lte: dayjs().endOf("day").toDate(),
      },
    });

    // Prepare chat history for the prompt
    const chatHistoryMessages =
      chatHistory?.chats
        ?.map((chat) => `Human: ${chat.human}\nBot: ${chat.bot}`)
        .join("\n") || "";

    // Define the prompt with the chat history as context
    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `You are a personal assistant helping in managing user's memorable events. Always calculate the date based on today(${dayjs().toISOString()}) and pass the correct date given by the user to the tools. If the date is not given, ask the user for the date and possibly time as well. Ask for more details related the memory like name of people involved in the memory, about the place, etc. Be a little creative.* and pass it to the tool with full detail of the memory. To qualify as a memory it should have date, details, emotions felt, name of the people involved, location. You have access to the following tools.`,
      ],
      ["system", `Chat History:\n${chatHistoryMessages}`], // Adding chat history as context
      ["human", "{input}"],
      ["placeholder", "{agent_scratchpad}"],
    ]);

    const agent = createToolCallingAgent({ llm, tools, prompt });

    const agentExecutor = new AgentExecutor({
      agent,
      tools,
    });

    const result = await agentExecutor.invoke({
      input: req, // New message input
    });

    console.log("result:", result);

    // Update chat history with the new conversation
    await chatModel.findOneAndUpdate(
      {
        createdAt: {
          $gte: dayjs().startOf("day").toDate(),
          $lte: dayjs().endOf("day").toDate(),
        },
      },
      {
        $push: {
          chats: { $each: [{ human: result.input, bot: result.output }] }, // Push new chat into history
        },
      },
      { upsert: true } // Create a new entry if none exists
    );

    return result.output;
  } catch (error) {
    console.log(error);
  }
}
