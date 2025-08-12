import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import parse from 'html-react-parser';
import LoadingSpinner from "./LoadingSpinner";
import { MapPin, AlertCircle, Info, ArrowLeft, Globe, Clock, Calendar, Users, Building, Landmark } from "lucide-react";
import { motion } from "framer-motion";

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
  const [error, setError] = useState(null);
  const [showFullContent, setShowFullContent] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setAnswer("");
    setError(null);

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

      if (!res.ok) {
        throw new Error(`API request failed with status ${res.status}`);
      }

      const data = await res.json();
      if (data?.choices?.[0]?.message?.content) {
        setAnswer(data.choices[0].message.content);
        setShowFullContent(false); // Reset expanded state on new content
      } else {
        setError("No response content received from AI.");
      }
    } catch (error) {
      console.error("Error fetching from OpenRouter:", error);
      setError(error.message || "Error fetching city information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [state]);

  // Extract HTML content from the AI response
  const extractHtmlContent = (response) => {
    try {
      // First try to match HTML code block with explicit html tag
      const htmlMatch = response.match(/```html\s*([\s\S]*?)\s*```/);
      if (htmlMatch && htmlMatch[1]) {
        return htmlMatch[1].trim();
      }
      
      // Then try to match any code block that might contain HTML
      const codeBlockMatch = response.match(/```([\s\S]*?)```/);
      if (codeBlockMatch && codeBlockMatch[1]) {
        // Check if it looks like HTML (contains HTML tags)
        if (/<\/?[a-z][\s\S]*>/i.test(codeBlockMatch[1])) {
          return codeBlockMatch[1].trim();
        }
      }
      
      // Fallback to the old method if the regex doesn't match
      const parts = response.split("```");
      if (parts.length >= 2) {
        return parts[1].trim();
      }
      
      // Last resort: return the whole response if it contains HTML tags
      if (/<\/?[a-z][\s\S]*>/i.test(response)) {
        return response;
      }
      
      return `<div class="p-6">${response}</div>`;
    } catch (err) {
      console.error("Error extracting HTML content:", err);
      return `<div class="p-6">${response}</div>`;
    }
  };

  return (
    <motion.div 
      className="relative w-full max-w-6xl mx-auto px-4 py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Navigation and City name header */}
      <div className="mb-8">
        <Link to="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors">
          <ArrowLeft size={18} className="mr-1" />
          <span>Back to Dashboard</span>
        </Link>
        
        <div className="flex items-center">
          <div className="bg-blue-600 p-3 rounded-full mr-4">
            <Globe className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{state}</h1>
            <p className="text-gray-500">Detailed City Information</p>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <motion.div 
          className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-sm"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <LoadingSpinner size="lg" className="text-blue-600" />
          <p className="mt-6 text-gray-600 animate-pulse text-lg">Gathering comprehensive information about {state}...</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <div className="flex items-center text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              <Clock size={14} className="mr-1" />
              <span className="text-sm">History</span>
            </div>
            <div className="flex items-center text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              <Users size={14} className="mr-1" />
              <span className="text-sm">Culture</span>
            </div>
            <div className="flex items-center text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              <Building size={14} className="mr-1" />
              <span className="text-sm">Economy</span>
            </div>
            <div className="flex items-center text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              <Landmark size={14} className="mr-1" />
              <span className="text-sm">Attractions</span>
            </div>
            <div className="flex items-center text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              <Calendar size={14} className="mr-1" />
              <span className="text-sm">Travel Tips</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error state */}
      {error && (
        <motion.div 
          className="bg-white rounded-xl shadow-md overflow-hidden mb-6"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="p-6 border-l-4 border-red-500">
            <div className="flex items-start">
              <div className="bg-red-100 p-2 rounded-full mr-4">
                <AlertCircle className="text-red-500" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-red-800 mb-2">Unable to Load City Information</h3>
                <p className="text-red-700 mb-4">{error}</p>
                <button 
                  onClick={handleSearch} 
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Content display */}
      {answer && !loading && (
        <motion.div 
          className="city-information-container bg-white rounded-xl shadow-lg overflow-hidden"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className={`city-content ${!showFullContent ? 'max-h-[1200px] overflow-hidden relative' : ''}`}>
            {parse(extractHtmlContent(answer))}
            
            {!showFullContent && (
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent flex items-end justify-center pb-4">
                <button 
                  onClick={() => setShowFullContent(true)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-all transform hover:scale-105"
                >
                  Show More
                </button>
              </div>
            )}
          </div>
          
          <div className="p-5 bg-blue-50 border-t border-blue-100 mt-2">
            <div className="flex items-start max-w-3xl mx-auto">
              <Info className="text-blue-600 mr-3 mt-0.5 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm text-blue-800 font-medium">Information provided by AI</p>
                <p className="text-xs text-blue-700 mt-1">Details may vary and should be verified before travel. This information is generated using AI and may not reflect the most current data.</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DetailedSearch;



