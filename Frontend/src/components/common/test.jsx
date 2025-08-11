import { useEffect, useState } from "react";
import axios from "axios";
import CardCarousel from "./GenericImageCardHolder";
import PlaceCard from "./PlaceDetailCard";
import LoadingSpinner from "./LoadingSpinner";

export default function OpenRouterChat({ prompt }) {
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

    useEffect(()=>{
        sendToAI();
    }, [prompt])

    return (
        <div>

            {response && (
                <>
                    {
                         !response && <LoadingSpinner /> 
                    }
                    {
                        response && <CardCarousel heading={"Religious Places"} children={<>
                            {
                                JSON.parse(response.slice(7, response.length-3))?.map((ele, id) => {
                                    return (
                                        <PlaceCard details={ele} />
                                    )
                                })
                            }
                    </>} />
                    }
                </>



            )}
        </div>
    );
}
