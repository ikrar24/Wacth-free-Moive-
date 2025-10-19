import express from "express";
import cors from "cors";
import { SearchApi } from "./Routes/SearchPara.js";
import { cookieString, userAgent } from "./Coockies/Coockies.js";
import playVideo from "./Routes/playVideo.js";

const app = express();

// Middleware
app.use(cors()); // Allow requests from frontend
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Search Data For Global Using
let searchData = [];

// Search Route
app.post("/search", async (req, res) => {
  try {
    const query = req.query.s;
    const data = await SearchApi(query);

    if (!data.searchResult || data.searchResult.length === 0) {
      return res.status(404).json({ message: "No results found", searchResult: [] });
    }

    // Fetch details for each search result
    const detailedResults = await Promise.all(
      data.searchResult.map(async (item) => {
        try {
          const response = await fetch(`https://net20.cc/post.php?id=${item.id}`, {
            headers: {
              Cookie: cookieString,
              "User-Agent": userAgent,
            },
            method: "GET",
          });

          const json = await response.json();
          return {
            id: item.id,
            details: json,
            thumbnails: `https://imgcdn.kim/poster/341/${item.id}.jpg`,
          };
        } catch (error) {
          console.error(`Error fetching id ${item.id}:`, error);
          return { id: item.id, error: true };
        }
      })
    );

    res.status(201).json(detailedResults);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Play Video Route
app.post("/play-video", playVideo);

// Proxy Route
app.get("/proxy", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send("Missing ?url param");

  try {
    const response = await fetch(targetUrl);
    const contentType = response.headers.get("content-type");

    if (contentType) res.setHeader("Content-Type", contentType);

    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).send("Proxy error: " + err.message);
  }
});

// Start Server
app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
