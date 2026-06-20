import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";

const openai = new OpenAI({
    baseURL: "https://www.google.com/search?q=v1+api.groq.com",
    apiKey: process.env.GROQ_API_KEY,
});

try {
    const response = await openai.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: "Hello" }],
    });
    console.log(response.choices[0]?.message?.content);
} catch (error) {
    console.error(error);
}