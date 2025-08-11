import axios from 'axios';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const BASE_URL = import.meta.env.VITE_GEMINI_API_URL;

const generateContent = async (text) => {
  const url = `${BASE_URL}?key=${API_KEY}`;

  const headers = {
    'Content-Type': 'application/json',
  };

  const data = {
    contents: [{
      parts: [{ text }]
    }]
  };

  try {
    const response = await axios.post(url, data, { headers });
    return response.data;
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
};

export default generateContent;