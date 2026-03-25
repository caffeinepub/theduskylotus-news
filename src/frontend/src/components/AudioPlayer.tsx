import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useBlobUrl } from "../hooks/useBlobUrl";

interface AudioPlayerProps {
  audioFileId: string;
}

export default function AudioPlayer({ audioFileId }: AudioPlayerProps) {
  const audioUrl = useBlobUrl(audioFileId);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime);
    if (audio.duration) {
      setProgress((audio.currentTime / audio.duration) * 100);
    }
  }, []);

  const handleLoaded = useCallback(() => {
    const audio = audioRef.current;
    if (audio) setDuration(audio.duration);
  }, []);

  const handleEnded = useCallback(() => setPlaying(false), []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: audioRef is a stable ref
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoaded);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoaded);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl, handleTimeUpdate, handleLoaded, handleEnded]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      try {
        await audio.play();
        setPlaying(true);
      } catch (e) {
        console.error("Audio playback failed", e);
      }
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !muted;
    setMuted(!muted);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    audio.currentTime = pct * duration;
  };

  const handleSeekKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    if (e.key === "ArrowRight")
      audio.currentTime = Math.min(audio.currentTime + 5, duration);
    if (e.key === "ArrowLeft")
      audio.currentTime = Math.max(audio.currentTime - 5, 0);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (!audioUrl) return null;

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-50 bg-footer/95 backdrop-blur-md border-t border-white/10"
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      data-ocid="audio.panel"
    >
      <audio ref={audioRef} src={audioUrl} muted={muted} preload="metadata" />
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
        <button
          type="button"
          onClick={togglePlay}
          className="flex-shrink-0 w-9 h-9 rounded-full bg-gold flex items-center justify-center hover:bg-gold/90 transition-colors"
          aria-label={playing ? "Pause" : "Play"}
          data-ocid="audio.button"
        >
          {playing ? (
            <Pause className="h-4 w-4 text-white" />
          ) : (
            <Play className="h-4 w-4 text-white ml-0.5" />
          )}
        </button>

        <div className="flex-1 flex items-center gap-2">
          <span className="font-body text-xs text-footer opacity-60 w-8 text-right">
            {formatTime(currentTime)}
          </span>
          <div
            role="slider"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            aria-label="Audio progress"
            tabIndex={0}
            className="flex-1 h-1.5 bg-white/20 rounded-full cursor-pointer relative"
            onClick={handleSeek}
            onKeyDown={handleSeekKey}
          >
            <div
              className="h-full bg-gold rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="font-body text-xs text-footer opacity-60 w-8">
            {formatTime(duration)}
          </span>
        </div>

        <button
          type="button"
          onClick={toggleMute}
          className="flex-shrink-0 text-footer opacity-70 hover:opacity-100 transition-opacity"
          aria-label={muted ? "Unmute" : "Mute"}
          data-ocid="audio.toggle"
        >
          {muted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </button>

        <div className="hidden sm:block font-body text-xs text-footer opacity-50 max-w-32 truncate">
          🎵 Article Audio
        </div>
      </div>
    </motion.div>
  );
}
