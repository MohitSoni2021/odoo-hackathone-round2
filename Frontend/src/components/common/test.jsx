import { useState } from "react";
import axios from "axios";

export default function OpenRouterChat({prompt}) {
  const [input, setInput] = useState(prompt);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const sendToAI = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResponse("");

    try {
      const res = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "openai/gpt-4o-mini", // you can change the model
          messages: [{ role: "user", content: input }],
        },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      setResponse(res.data.choices[0].message.content);
    } catch (err) {
      console.error(err);
      setResponse("Error: Unable to fetch AI response.");
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Ask OpenRouter AI</h2>

      <textarea
        className="w-full p-3 border rounded-lg focus:outline-none focus:ring"
        rows="4"
        placeholder="Type your question here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button
        onClick={sendToAI}
        disabled={loading}
        className="mt-3 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? "Loading..." : "Ask AI"}
      </button>

      {response && (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg whitespace-pre-wrap">
          {response}
        </div>
        
      )}
    </div>
  );
}
