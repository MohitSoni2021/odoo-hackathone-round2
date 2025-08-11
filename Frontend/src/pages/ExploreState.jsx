import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { getStateDetails } from '../utils/Prompts';
import axios from 'axios';

const ExploreState = () => {
    const { state } = useParams();
    const [input, setInput] = useState(getStateDetails);
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
                    messages: [{ role: "user", content: getStateDetails(state) }],
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

    useEffect(()=>{
        sendToAI();
    }, [prompt])


  return (
    <div>

            {
                <div dangerouslySetInnerHTML={{ __html: response }} />
            }
        </div>
  )
}

export default ExploreState
