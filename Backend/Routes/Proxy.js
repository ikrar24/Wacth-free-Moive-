import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.get("/proxy", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ message: "URL required" });

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "*/*"
      }
    });

    const contentType = response.headers.get("content-type");
    const text = await response.text(); // <-- always try to parse as text

    // Must start with "#EXTM3U" for HLS
    if (!text.startsWith("#EXTM3U")) {
      console.error("Invalid M3U8:", text.slice(0, 100));
      return res.status(500).send("Invalid M3U8 format");
    }

    res.set({
      "Content-Type": contentType || "application/vnd.apple.mpegurl",
      "Access-Control-Allow-Origin": "*",
    });

    res.send(text);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ message: "Proxy failed" });
  }
});

export default router;
