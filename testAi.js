import Groq from 'groq-sdk';
import 'dotenv/config';
const groq = new Groq({
    apiKey: process.env.GROK_API,
});
const test = async () => {
    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: 'Hello!' }],
            model: 'llama-3.1-8b-instant',
        });
        console.log('✅ Test passed:', completion.choices[0]?.message?.content);
    }
    catch (error) {
        console.log('❌ Test failed:', error);
    }
};
test();
