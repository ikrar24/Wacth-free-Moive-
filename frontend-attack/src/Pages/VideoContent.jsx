import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Hls from "hls.js";
import { CiPlay1, CiPause1 } from "react-icons/ci";
import { RxExitFullScreen, RxEnterFullScreen } from "react-icons/rx";
import Thumbnails from "../Components/Thumbnails";

function VideoContent() {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const controlsRef = useRef(null);
  const hlsRef = useRef(null);

  const locationState = useLocation();
  const { thumbnails, title, id } = locationState.state || [];

  const [play, setPlay] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [lang, setLang] = useState("hi");
  const [quality, setQuality] = useState("1080p");
  const [buffered, setBuffered] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [VideoSrc, setVideoSrc] = useState([]);
  const [Audio, setAudio] = useState([]);
  const [seekAnim, setSeekAnim] = useState(null);

  // Update src when lang or quality changes
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    const current = video.currentTime;
    const wasPlaying = play;
    video.currentTime = current;
    audio.currentTime = current;
    if (wasPlaying) {
      video.play();
      audio.play();
    }
  }, [lang, quality]);

  // Play / Pause Handler with HLS + Proxy
  const handlePlayPause = async () => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (!VideoSrc.length) {
      const response = await fetch("http://localhost:3001/play-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const videoData = await response.json();

      // Save audio/video tracks
      setVideoSrc(videoData.audioVideoTracks.videoStreams);
      setAudio(videoData.audioVideoTracks.audioTracks);
console.log(videoData);

      const videoUrl = videoData.playSrc[0].sources[0].file;
      console.log( "https://net20.cc"+ videoUrl);
      
// const currentUrl = videoUrl.replace("https://s21.nm-cdn4.top", "https://net20.cc");
// console.log(currentUrl);
      if (videoUrl) {
        const proxyUrl = `http://localhost:3001/proxy?url=${encodeURIComponent("https://net20.cc"+videoUrl)}`;
        const hls = new Hls();
        hlsRef.current = hls;

        if (Hls.isSupported()) {
          hls.loadSource(proxyUrl);
          hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = proxyUrl; // Safari native support
        }
      }
    }

    if (!play) {
      video.play();
      audio.currentTime = video.currentTime;
      audio.play();
    } else {
      video.pause();
      audio.pause();
    }

    setPlay(!play);
  };

  // Cleanup HLS
  useEffect(() => () => hlsRef.current?.destroy(), []);

  const handleFullScreen = () => {
    const videoContainer = videoRef.current.parentElement;
    if (!fullScreen) videoContainer.requestFullscreen?.();
    else document.exitFullscreen?.();
    setFullScreen(!fullScreen);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    const audio = audioRef.current;
    setCurrentTime(video.currentTime);
    setDuration(video.duration || 0);
    if (Math.abs(video.currentTime - audio.currentTime) > 0.2)
      audio.currentTime = video.currentTime;

    if (video.buffered.length > 0) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      setBuffered((bufferedEnd / video.duration) * 100);
    }
  };

  const handleMouseMove = () => {
    if (play) {
      setShowControls(true);
      clearTimeout(controlsRef.current);
      controlsRef.current = setTimeout(() => setShowControls(false), 2000);
    }
  };

  const handleTimelineClick = (e) => {
    const progress = e.nativeEvent.offsetX / e.target.offsetWidth;
    const video = videoRef.current;
    const audio = audioRef.current;
    const newTime = progress * video.duration;
    video.currentTime = newTime;
    audio.currentTime = newTime;
  };

  const handleDoubleClick = (e) => {
    const video = videoRef.current;
    const audio = audioRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const half = rect.width / 2;
    if (x > half) {
      video.currentTime = Math.min(video.duration, video.currentTime + 10);
      audio.currentTime = video.currentTime;
      setSeekAnim("+10s");
    } else {
      video.currentTime = Math.max(0, video.currentTime - 10);
      audio.currentTime = video.currentTime;
      setSeekAnim("-10s");
    }
    setTimeout(() => setSeekAnim(null), 800);
  };

  useEffect(() => {
    const video = videoRef.current;
    const setVideoDuration = () => setDuration(video.duration || 0);
    video.addEventListener("loadedmetadata", setVideoDuration);
    video.addEventListener("waiting", () => setIsBuffering(true));
    video.addEventListener("playing", () => setIsBuffering(false));

    if (!play) setShowControls(true);
    else controlsRef.current = setTimeout(() => setShowControls(false), 2000);

    return () => {
      video.removeEventListener("loadedmetadata", setVideoDuration);
      video.removeEventListener("waiting", () => setIsBuffering(true));
      video.removeEventListener("playing", () => setIsBuffering(false));
      clearTimeout(controlsRef.current);
    };
  }, [play]);

  const formatTime = (time) => {
    if (!time) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <>
      <nav className="flex w-full items-center justify-center text-white p-2 uppercase font-bold shadow-2xl shadow-red-300">
        <ul>
          <li><Link to="/">SeachMovie.Com</Link></li>
        </ul>
      </nav>

      <div className="w-full h-full flex flex-col items-center justify-center p-5 bg-black select-none">
        <div
          className="relative w-[80%] h-[50vh] md:h-[80vh]"
          onMouseMove={handleMouseMove}
          onDoubleClick={handleDoubleClick}
        >
          {!play && <Thumbnails thumbnailSrc={thumbnails} />}
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${!play ? "hidden" : "block"}`}
            onTimeUpdate={handleTimeUpdate}
            controls={false}
          />
          <audio ref={audioRef} src={Audio[0]?.uri}></audio>

          {isBuffering && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {seekAnim && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-3xl font-bold opacity-70 animate-ping">
              {seekAnim}
            </div>
          )}

          {showControls && (
            <>
              <div
                className="absolute cursor-pointer md:top-[45%] top-[40%] left-[45%] text-white"
                onClick={handlePlayPause}
              >
                {play ? <CiPause1 size={80} /> : <CiPlay1 size={80} />}
              </div>

              <div className="absolute bottom-16 left-2 text-white flex gap-1">
                <p>{formatTime(currentTime)}</p> <span>/</span> <p>{formatTime(duration)}</p>
              </div>

              <div
                className="absolute w-full h-[4px] bottom-0 bg-gray-800 cursor-pointer"
                onClick={handleTimelineClick}
              >
                <div className="absolute h-full bg-black opacity-50" style={{ width: `${buffered}%` }}></div>
                <div
                  className="absolute h-full bg-white"
                  style={{ width: duration ? `${(currentTime / duration) * 100}%` : "0%" }}
                />
              </div>

              <div
                className="bottom-8 right-2 absolute cursor-pointer text-white"
                onClick={handleFullScreen}
              >
                {fullScreen ? <RxExitFullScreen size={20} /> : <RxEnterFullScreen size={20} />}
              </div>

              <select
                className="absolute top-2 right-24 bg-black/30 text-white px-2 py-1 rounded-md"
                value={lang}
                onChange={(e) => setLang(e.target.value)}
              >
                <option value="hi">Hindi</option>
                <option value="en">English</option>
              </select>

              <select
                className="absolute top-2 right-2 bg-black/30 text-white px-2 py-1 rounded-md"
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
              >
                <option value="1080p">1080p</option>
                <option value="720p">720p</option>
              </select>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default VideoContent;
