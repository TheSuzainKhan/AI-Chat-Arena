import express from 'express';
import runGraph from "./ai/graph.ai.js"
import cors from "cors"
import path from "path"

const app = express();
app.use(express.json())
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
}))


app.get('/', async (req, res) => {

    const result = await runGraph("Write an code for Factorial function in js")

    res.json(result)
})

app.post("/invoke", async (req, res) => {
    const input = typeof req.body?.input === "string" ? req.body.input.trim() : ""

    if (!input) {
        return res.status(400).json({ success: false, error: { code: "INVALID_INPUT", message: "Please enter a coding question before sending." } })
    }

    try {
        const result = await runGraph(input)
        return res.status(200).json({ message: "Graph executed successfully", success: true, result })
    } catch (error) {
        console.error("Failed to invoke graph:", error)
        return res.status(500).json({ success: false, error: { code: "GRAPH_FAILED", message: "The arena could not process your question. Please try again." } })
    }
})

app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (error instanceof SyntaxError) {
        return res.status(400).json({ success: false, error: { code: "INVALID_JSON", message: "Please send a valid request." } })
    }
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Something went wrong. Please try again." } })
})

app.use('*name', (req, res) => {
    res.sendFile(path.join(__dirname, "..", "/public/index.html"))
})


export default app;
