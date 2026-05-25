import { ChatOpenAI } from "@langchain/openai";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";

export function getLCModel(apiKey: string, temperature = 0) {
  if (!apiKey) {
    throw new Error("Missing API key in getLCModel()");
  }

  return new ChatOpenAI({
    apiKey,
    model: "gpt-4o",
    temperature: temperature,
  });
}

export async function callLC(model: ChatOpenAI, messages: any[]) {
  const converted = messages.map((m) => {
    if (m.role === "system") return new SystemMessage(m.content);
    if (m.role === "assistant") return new AIMessage(m.content);
    return new HumanMessage(m.content);
  });

  const response = await model.invoke(converted);
  return response.content as string;
}
