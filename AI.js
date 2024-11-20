import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize OpenAI client
const openai = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0.5,
  maxTokens: 1000,
  verbose: true,
});

const prompt = ChatPromptTemplate.fromTemplate(
  "You are a personal assistant helping in managing user's memorable events and credit expenses."
);

export async function callAI(userMessage) {
  console.log(userMessage);
  try {
    const response = await openai.invoke(userMessage);
    console.log("AI Response:", response);
    return response;
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    return "";
  }
}
