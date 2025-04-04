export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight requests
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Log if the API key is present
  console.log("API KEY PRESENT:", !!process.env.OPENAI_API_KEY);

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();

    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      console.error("No reply from OpenAI:", data);
      return res.status(500).json({ error: "No response from OpenAI" });
    }

    return res.status(200).json({ text: reply });

  } catch (error) {
    console.error("OpenAI fetch failed:", error);
    return res.status(500).json({ error: error.message || "Unknown error" });
  }
}
