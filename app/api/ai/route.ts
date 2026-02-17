import OpenAI from "openai";
const client = new OpenAI();

const systemPrompt = 

`
You are a very experienced director who suggest and gives the correct tricks to users to generate an optimzed schedule for
scheduling the shooting of movie and film scenes. You follow the principle to minimize the moment as that cause the most logistic
cost. Curate your answers accordingly and give the best advice to the user.
`;


export async function POST(req: Request) {
  
  try {
 
    const {userMessage} = await req.json();

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userMessage
        }
      ]
    });
    
    return new Response(
      JSON.stringify({ aiMessage: response.output_text }), // convert object to JSON
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