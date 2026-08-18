"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Download,
  Copy,
  Check,
  Sparkles,
  Radio,
  User,
  Users,
} from "lucide-react";
import { AudioLinesIcon } from "@/components/ui/audio-lines";
import { PodcastContent } from "../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface PodcastViewerProps {
  content?: { podcast?: PodcastContent } | null;
}

export function PodcastViewer({ content }: PodcastViewerProps) {
  const podcast = content?.podcast;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);

  const turns = podcast?.transcript || [];
  const audioUrl = podcast?.audioUrl;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      if (!isNaN(audio.duration)) setDuration(audio.duration);
    };
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const skipTime = (seconds: number) => {
    if (!audioRef.current) return;
    const newTime = Math.min(Math.max(audioRef.current.currentTime + seconds, 0), duration || 9999);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const cyclePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 2];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const copyTranscript = () => {
    if (!turns.length) return;
    const fullText = turns
      .map((t) => `${t.speaker.toUpperCase()}:\n${t.text}`)
      .join("\n\n");
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "00:00";
    const minutes = Math.floor(secs / 60);
    const remainingSeconds = Math.floor(secs % 60);
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  if (!podcast || turns.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground space-y-3">
        <Radio className="w-8 h-8 mx-auto animate-pulse text-muted-foreground" />
        <p className="text-sm">Podcast debate script is generating...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Hidden audio element */}
      {audioUrl && (
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
      )}

      {/* Podcast Audio Player Hero Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-md space-y-4">
        {/* Header & Status */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary text-primary-foreground">
              <AudioLinesIcon size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  {podcast.topic || "AI Deep-Dive Debate Podcast"}
                </h3>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-1">
                  <Sparkles className="w-3 h-3 text-primary" />
                  ElevenLabs AI Voice
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Hosted by <strong>Alex</strong> (Analyst) & <strong>Jordan</strong> (Challenger)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="xs"
              onClick={copyTranscript}
              className="gap-1 text-xs"
              title="Copy entire debate transcript"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Transcript</span>
                </>
              )}
            </Button>

            {audioUrl && (
              <a
                href={audioUrl}
                download="chaibook-debate-podcast.mp3"
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="outline" size="xs" className="gap-1 text-xs">
                  <Download className="w-3.5 h-3.5" />
                  <span>MP3</span>
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Animated Sound Wave Visualizer */}
        <div className="h-10 w-full bg-secondary/50 rounded-xl flex items-center justify-center gap-1 px-4 overflow-hidden border border-border/60">
          {Array.from({ length: 32 }).map((_, i) => (
            <div
              key={i}
              className={`w-1 rounded-full bg-primary/70 transition-all duration-150 ${
                isPlaying ? "animate-pulse" : "opacity-40"
              }`}
              style={{
                height: isPlaying
                  ? `${Math.max(15, Math.sin(i + currentTime * 3) * 80 + 20)}%`
                  : `${(i % 5) * 15 + 15}%`,
                animationDelay: `${(i % 8) * 100}ms`,
              }}
            />
          ))}
        </div>

        {/* Progress Bar & Timestamps */}
        <div className="space-y-1">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            disabled={!audioUrl}
            className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50"
          />
          <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{duration > 0 ? formatTime(duration) : (podcast.durationEstimate || "~1:00")}</span>
          </div>

        </div>

        {/* Player Controls Bar */}
        <div className="flex items-center justify-between pt-1">
          {/* Volume toggle */}
          <button
            type="button"
            onClick={toggleMute}
            disabled={!audioUrl}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Center Playback Controls */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => skipTime(-10)}
              disabled={!audioUrl}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-all active:scale-95 disabled:opacity-40"
              title="Rewind 10 seconds"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              disabled={!audioUrl}
              className="p-3.5 bg-primary text-primary-foreground hover:opacity-90 rounded-full transition-all shadow-md active:scale-95 disabled:opacity-50"
              title={isPlaying ? "Pause" : "Play Podcast"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-primary-foreground" />
              ) : (
                <Play className="w-5 h-5 fill-primary-foreground translate-x-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => skipTime(10)}
              disabled={!audioUrl}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-all active:scale-95 disabled:opacity-40"
              title="Fast forward 10 seconds"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Speed Toggle */}
          <button
            type="button"
            onClick={cyclePlaybackRate}
            disabled={!audioUrl}
            className="px-2 py-1 text-xs font-mono font-semibold text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 rounded-md border border-border transition-colors disabled:opacity-40"
          >
            {playbackRate}x
          </button>
        </div>
      </div>

      {/* Podcast Summary Banner */}
      {podcast.summary && (
        <div className="p-4 rounded-xl bg-secondary/40 border border-border text-xs text-muted-foreground leading-relaxed space-y-1">
          <span className="font-semibold text-foreground block">
            Episode Synopsis:
          </span>
          <p>{podcast.summary}</p>
        </div>
      )}

      {/* Interactive Multi-Speaker Debate Transcript */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Debate Transcript ({turns.length} Exchanges)
          </h4>
        </div>

        <div className="space-y-3">
          {turns.map((turn, index) => {
            const isAlex = turn.speaker === "Alex";

            return (
              <div
                key={index}
                className={`p-4 rounded-2xl border transition-all ${
                  isAlex
                    ? "bg-card border-border/80 ml-0 mr-4 sm:mr-8"
                    : "bg-secondary/50 border-border/60 ml-4 sm:ml-8 mr-0"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1 rounded-full text-[10px] font-bold ${
                        isAlex
                          ? "bg-primary text-primary-foreground"
                          : "bg-foreground text-background"
                      }`}
                    >
                      <User className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-bold text-foreground font-sans">
                      {turn.speaker}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {isAlex ? "Analyst" : "Challenger"}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-muted-foreground">
                    #{index + 1}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed pl-6">
                  {turn.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
