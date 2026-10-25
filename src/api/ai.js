import client from "./client";

export async function chat({ message, history = [] }) {
  const { data } = await client.post("/ai/chat", { message, history });
  return data; // { reply, aiGenerated, toolsUsed }
}

export async function summarize(kpis) {
  const { data } = await client.post("/ai/summarize", { kpis });
  return data; // { summary, aiGenerated }
}

export async function smartLeave(text) {
  const { data } = await client.post("/ai/smart-leave", { text });
  return data; // { leave: {type,startDate,endDate,reason}, aiGenerated }
}