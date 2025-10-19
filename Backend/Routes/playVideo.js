import fetch from "node-fetch";
import FormData from "form-data";
import { cookieString, userAgent } from "../Coockies/Coockies.js";

// Helper: Convert WEBVTT to JSON (thumbnails)
const convertVttToJson = (vttText) => {
  const lines = vttText.split("\n").filter(line => line.trim() !== "");
  const json = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes("-->")) {
      const [startStr, endStr] = line.split("-->");
      const start = parseFloat(startStr.replace(",", ".").trim());
      const end = parseFloat(endStr.replace(",", ".").trim());
      const urlLine = lines[i + 1]?.trim();
      if (urlLine) {
        const [url, xywh] = urlLine.split("#");
        json.push({ start, end, url, xywh: xywh?.replace("xywh=", "") || "" });
      }
      i++; // skip next line
    }
  }

  return json;
};

// Helper: Parse M3U8 playlist to JSON (audio + video tracks)
const parseM3U8 = (m3u8Text) => {
  const lines = m3u8Text.split("\n").filter(l => l.trim() !== "");
  const audioTracks = [];
  const videoStreams = [];

  lines.forEach((line, i) => {
    if (line.startsWith("#EXT-X-MEDIA:")) {
      const attrs = line.replace("#EXT-X-MEDIA:", "").split(",");
      const obj = {};
      attrs.forEach(attr => {
        const [key, value] = attr.split("=");
        obj[key.toLowerCase()] = value?.replace(/"/g, "");
      });
      audioTracks.push(obj);
    } else if (line.startsWith("#EXT-X-STREAM-INF:")) {
      const attrs = line.replace("#EXT-X-STREAM-INF:", "").split(",");
      const obj = {};
      attrs.forEach(attr => {
        const [key, value] = attr.split("=");
        obj[key.toLowerCase()] = value?.replace(/"/g, "");
      });
      obj.uri = lines[i + 1]?.trim(); // next line is URI
      videoStreams.push(obj);
    }
  });

  return { audioTracks, videoStreams };
};

const playVideo = async (req, res) => {
  const id = req.body?.id || req.query?.id;
  if (!id) return res.status(401).json({ message: "Id is required" });

  try {
    // 1️⃣ Get hash code
    const formData = new FormData();
    formData.append("id", id);

    const hashResponse = await fetch("https://net20.cc/play.php", {
      method: "POST",
      body: formData,
      headers: formData.getHeaders(),
    });
    const hashData = await hashResponse.json();
    const hashString = hashData.h;

    // 2️⃣ Get video sources
    const playResponse = await fetch(`https://net20.cc/playlist.php?id=${id}`, {
      method: "POST",
    });
    const playData = await playResponse.json();

    // 3️⃣ Replace 'unknown' with hash
    const updatedPlayData = playData.map(item => {
      if (item.sources && Array.isArray(item.sources)) {
        item.sources = item.sources.map(source => {
          if (source.file.includes("in=unknown::ni")) {
            source.file = source.file.replace("in=unknown::ni", hashString);
          }
         
          
          return "https://net20.cc"+source.file;
        });
      }
      return item;
    });

    // 4️⃣ Fetch thumbnails
    let thumbnails = [];
    try {
      const vttResponse = await fetch(`https://back01.nfmirrorcdn.top/vtt/${id}.vtt`, {
        method: "POST",
      });
      if (vttResponse.ok) {
        const vttText = await vttResponse.text();
        thumbnails = convertVttToJson(vttText);
      }
    } catch (err) {
      console.log("Thumbnails not available:", err.message);
    }

    // 5️⃣ Fetch audio/video tracks
    let audioVideoTracks = {};
    try {
      const m3u8Response = await fetch(`https://net51.cc/playlist.php?id=${id}`,{
        method:"POST",
        headers:{
           Cookie: cookieString,
            "User-Agent": userAgent
        }
      });
      if (m3u8Response.ok) {
        const m3u8Text = await m3u8Response.text();
        audioVideoTracks = parseM3U8(m3u8Text);
      }
    } catch (err) {
      console.log("Audio/Video playlist not available:", err.message);
    }

    // 6️⃣ Send final JSON response
    res.status(200).json({
      success: true,
      playSrc: updatedPlayData,
      thumbnails,
      audioVideoTracks
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default playVideo;
