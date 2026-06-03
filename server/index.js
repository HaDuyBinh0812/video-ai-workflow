const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 4000;
const API_KEY = process.env.GEMINI_API_KEY;

let genAI = null;
function getGenAI() {
    if (!genAI && API_KEY) genAI = new GoogleGenerativeAI(API_KEY);
    return genAI;
}

// Single proxy endpoint for all Gemini calls from frontend
app.post("/api/gemini/generate", async (req, res) => {
    const ai = getGenAI();
    if (!ai)
        return res
            .status(400)
            .json({ error: "GEMINI_API_KEY not configured on server" });

    const { prompt, imageBase64, imageMimeType } = req.body;
    if (!prompt) return res.status(400).json({ error: "prompt is required" });

    try {
        const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
        const parts = imageBase64
            ? [
                  {
                      inlineData: {
                          data: imageBase64,
                          mimeType: imageMimeType || "image/jpeg",
                      },
                  },
                  prompt,
              ]
            : [prompt];

        const result = await model.generateContent(parts);
        const text = result.response.text();
        res.json({ text });
    } catch (err) {
        console.error("[Gemini proxy error]", err);
        res.status(500).json({ error: String(err.message || err) });
    }
});

app.get("/api/health", (req, res) => res.json({ ok: true, hasKey: !!API_KEY }));

app.listen(PORT, () => {
    console.log(`Proxy server: http://localhost:${PORT}`);
    console.log(
        `Gemini API key: ${API_KEY ? "✓ configured" : "✗ missing (set GEMINI_API_KEY)"}`,
    );
});
