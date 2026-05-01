export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { question, context } = req.body;

  if (!question) {
    return res.status(400).json({ error: "No question" });
  }

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
                    "Sən tələbələrə kömək edən assistentsən. Yalnız material əsasında cavab ver.\n\nMaterial:\n" +
                    context +
                    "\n\nSual:\n" +
                    question
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Cavab tapılmadı";

    res.status(200).json({ reply });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
}
