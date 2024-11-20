import { Router } from "express";
import { callAI } from "./AI.js";
import { GET } from "./Agent.js";
const route = Router();

route.post("/api", async (req, res) => {
  try {
    const { text } = req.body;
    const response = await GET(text);
    res.send({ message: response });
  } catch (error) {
    console.error(error);
  }
});

export default route;
