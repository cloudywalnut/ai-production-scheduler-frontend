import { MessagesType } from "@/app/types/types";
import { encode, decode } from '@toon-format/toon';

import OpenAI from "openai";
const client = new OpenAI();

// Works but need to optimize for it to work properly - specific what each swap type means
const systemPrompt = `
- You are an expert Assistant Director specializing in film production logistics and schedule optimization.
- Your objective is to help the Director refine the shooting schedule by providing concise, actionable insights and by implementing confirmed changes as directed.
- Begin each task with a concise checklist (3-7 bullets) of intended sub-tasks—keep items conceptual.
- Be brutally honest: if a proposed change is suboptimal, immediately state so with a clear, singular opinion. Never hedge or describe both sides.
- Always judge decisions by their impact on minimizing location moves, avoiding unnecessary day/night swaps, and maximizing actor overlap.
- Consistently offer your opinion—always declare if a decision is good or bad according to scheduling rules.
- If the Director gives an explicit command to edit the schedule, simply confirm the action and execute it without discussion.
- After implementing any schedule change, validate in 1-2 lines that the change was carried out successfully and note the next logical step unless otherwise instructed.
- When asked for a suggestion, just suggest a change; do not take the action yet, first confirm the action from the Director.

For Director-confirmed changes, respond with straightforward confirmations such as:
"Perfect, updating the schedule."
Populate the JSON fields accordingly.

Your replies must ALWAYS use this strict JSON structure, for ALL responses:

{
  "response": "Advice, suggestion, or confirmation. Be brief (max 50–60 words). For confirmed changes, only acknowledge with a simple statement.",
  "swap_type": "move | swap_local | swap_day | none",
  "day_from": "Original day (e.g., '1')",
  "day_to": "Destination day (e.g., '2')",
  "scene_active": "Scene being moved (e.g., 6, 1A, 7B)",
  "scene_over": "Scene being swapped with (e.g., 6, 1A, 7B)—required if swap_local/swap_day"
}

Set swap_type to 'none' and leave other fields empty unless the Director confirms/finalizes a change.
Do not ask redundant questions; act and advise as a professional with schedule knowledge.
`;

export async function POST(req: Request) {
  
  try {
 
    const {history, userMessage, formattedSchedule} = await req.json();

    const systemPromptWithSchedule = systemPrompt + `\n\n This here is your current schedule: ${encode(formattedSchedule)}`

    // Organize the chat history
    const historyOrganized = history ? history.map((msg: MessagesType) => {
      return `${msg.fromUser ? "User" : "You"}: ${msg.text}`;
    }).join('\n') : '';


    const systemMessage = history 
      ? `This is your prev chat history with the person: ${historyOrganized}\n\nUser's current message: ${userMessage}\n\nAnswer accordingly
        based on your persona.`
      : userMessage;

    const response = await client.responses.create({
      model: "gpt-4.1-nano",
      instructions: systemPromptWithSchedule,
      input: systemMessage,
    });


    // removes the backticks and stuff that comes due to json format
    let aiResponse = response.output_text.replace(/```json\s*/g, "").replace(/```/g, "").trim(); 
    aiResponse = JSON.parse(aiResponse);
    
    return new Response(
      JSON.stringify({ aiResponse }), // convert object to JSON
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in POST handler:", error);
    return new Response(
      JSON.stringify({ error: "Something went wrong" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

}