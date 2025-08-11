import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import parse from 'html-react-parser'
import LoadingSpinner from "./LoadingSpinner";

const prompt = (CITY_NAME) => {
  return (`
    ✅ 🎓 Enhanced Prompt for Premium Visual HTML City Information Module

🧑‍🏫 Role:  
You are a highly respected Geography & Travel Guide expert at a globally renowned university.  
Your mission is to create a visually appealing, responsive, and information-rich HTML module that presents detailed, verified information about the city: ${CITY_NAME}.  
The design must cater to both students and travelers, ensuring clarity, professional layout, and engaging presentation.

🎨 Design & Layout Guidelines  
🛠 Output a complete HTML page, styled entirely using Tailwind CSS.

📌 Theme & Aesthetic:
- \bg-white text-gray-800 font-sans\
- Consistent section spacing (\py-8 px-6 md:px-12\)
- Clear section separation with subtle \border-b border-gray-200\
- Use \rounded-xl shadow-md hover:shadow-lg transition-all duration-300\ for content cards
- Responsive typography (\text-lg leading-relaxed\ for body, larger bold headings)
- 100% width cover-style header with gradient background for title section
- Adequate white space, avoid clutter

🧱 Structure (Semantic HTML Required):  
Use:
- <header>, <section>, <article>, <aside>, <footer>
- Logical headings from <h1> to <h4> with spacing (\mb-4\ or \mb-6\)
- Include:
  ✅ Bullet points  
  ✅ Blockquotes with \italic text-gray-600\  
  ✅ Callout boxes with background color highlights

🌟 Content & Highlighting Rules  
🧑‍🎓 Target: Accessible, structured, and attractive for first-time readers.

✍ Tone & Language:
- Friendly, professional, and concise
- Include historical context, cultural elements, and traveler-friendly insights

📌 Mandatory Sections:
1. **City Overview** – Name, state, country, latitude, longitude, population, timezone (styled as definition list with subtle borders)
2. **History & Culture** – Brief but detailed narrative, blockquote for notable historical fact
3. **Economy & Lifestyle** – Key industries, living standards, notable trades
4. **Top Famous Places** – At least 5, each with name (bold), short description in card layout (\grid grid-cols-1 md:grid-cols-2 gap-6\)
5. **Travel Tips & Local Insights** – Bullet list with highlighted tips
6. 📌 **Summary** – Recap in a soft-highlight section

💎 Visual Enhancements:
- Use Lucide icons inline for section titles (\flex items-center gap-2\)
- Color accents for headings (\text-blue-600\ for h2, \text-green-600\ for h3)
- Callouts for key stats: \bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded\

❌ Strict Rules:
- Do NOT provide image links
- Do NOT use placeholders like example.com
- Do NOT output anything outside the HTML block
- Do NOT include incomplete or messy structure

💯 Final Output Expectations:
- Only valid, polished, copy-paste-ready HTML
- All Tailwind CSS classes inline
- Mobile-friendly, professional, premium presentation
- Relevant Lucide icons for each section
`
  )
}


const DetailedSearch = () => {
  const { state } = useParams();
  const [query, setQuery] = useState(prompt(state));
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setAnswer("");

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini", // You can use any available model from OpenRouter
          messages: [{ role: "user", content: query }],
        }),
      });

      const data = await res.json();
      if (data?.choices?.[0]?.message?.content) {
        setAnswer(data.choices[0].message.content);
      } else {
        setAnswer("No response from AI.");
      }
    } catch (error) {
      console.error("Error fetching from OpenRouter:", error);
      setAnswer("Error fetching answer.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{
    handleSearch();
  }, [state])

  return (
    <div >
      {
        !answer && <LoadingSpinner />
      }

      {answer && (
        <div style={{ marginTop: "20px", whiteSpace: "pre-wrap" }}>
          <strong>Answer:</strong>
          <p>{parse(answer.split("```")[1].slice(4).trim())}</p>
        </div>
      )}
    </div>
  );
};

export default DetailedSearch;



