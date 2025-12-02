const { GoogleGenerativeAI } = require("@google/generative-ai");

const getGeminiClient = (apiKey) => {
  const key = apiKey || process.env.GEMINI_API_KEY;

  if (!key) {
    throw new Error("Gemini API key not provided");
  }

  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: "gemini-pro" });
};

const generateCurriculum = async (topic, difficulty, depth, apiKey = null) => {
  const model = getGeminiClient(apiKey);

  const prompt = `Generate a comprehensive curriculum for the topic: "${topic}".
Difficulty level: ${difficulty}
Depth: ${depth}

Return ONLY a valid JSON object with this exact structure:
{
  "title": "curriculum title",
  "description": "brief description",
  "modules": [
    {
      "title": "module title",
      "lessons": [
        {
          "title": "lesson title",
          "content": "lesson content with detailed explanation"
        }
      ]
    }
  ]
}

Make the curriculum detailed and educational. Include 3-5 modules with 2-4 lessons each.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse curriculum from AI response");
  }

  return JSON.parse(jsonMatch[0]);
};

module.exports = { getGeminiClient, generateCurriculum };
