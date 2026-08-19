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
  MessageCircleQuestion,
  Loader2,
  X,
  Send,
  CornerDownRight,
} from "lucide-react";
import { AudioLinesIcon } from "@/components/ui/audio-lines";
import { PodcastContent, InterruptionItem } from "../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface PodcastViewerProps {
  content?: { podcast?: PodcastContent } | null;
  artifactId?: string;
  workspaceId?: string;
}

const SUGGESTED_INTERRUPTIONS = [
  "Can you give a concrete real-world example of this?",
  "What are the biggest trade-offs or limitations mentioned?",
  "How does this connect to earlier findings in the sources?",
  "Could you summarize the main takeaway in simpler terms?",
];

export function PodcastViewer({
  content,
  artifactId,
  workspaceId,
}: PodcastViewerProps) {
  const podcast = content?.podcast;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);

  // Interruption State
  const [interruptions, setInterruptions] = useState<InterruptionItem[]>(
    podcast?.interruptions || []
  );
  const [isInterruptModalOpen, setIsInterruptModalOpen] = useState(false);
  const [userQuestion, setUserQuestion] = useState("");
  const [isSubmittingInterrupt, setIsSubmittingInterrupt] = useState(false);
  const [interruptError, setInterruptError] = useState<string | null>(null);

  // Active playing interruption & resume queue
  const [activeInterruption, setActiveInterruption] =
    useState<InterruptionItem | null>(null);
  const [savedResumeTime, setSavedResumeTime] = useState<number>(0);

  const turns = podcast?.transcript || [];
  const mainAudioUrl = podcast?.audioUrl;

  // Sync initial interruptions from prop
  useEffect(() => {
    if (podcast?.interruptions) {
      setInterruptions(podcast.interruptions);
    }
  }, [podcast?.interruptions]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      if (!isNaN(audio.duration)) setDuration(audio.duration);
    };

    const handleEnded = () => {
      // If an interruption was playing, resume the main podcast seamlessly
      if (activeInterruption) {
        setActiveInterruption(null);
        if (mainAudioUrl) {
          audio.src = mainAudioUrl;
          audio.currentTime = savedResumeTime;
          audio
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
        } else {
          setIsPlaying(false);
        }
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [activeInterruption, mainAudioUrl, savedResumeTime]);

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
    const newTime = Math.min(
      Math.max(audioRef.current.currentTime + seconds, 0),
      duration || 9999
    );
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

  // Open "Interrupt & Ask" modal
  const handleOpenInterrupt = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setSavedResumeTime(audioRef.current.currentTime);
    }
    setInterruptError(null);
    setIsInterruptModalOpen(true);
  };

  // Submit interruption question
  const handleSendInterruption = async (questionToSend?: string) => {
    const q = (questionToSend || userQuestion).trim();
    if (!q || !artifactId || !workspaceId) return;

    setIsSubmittingInterrupt(true);
    setInterruptError(null);

    try {
      const interruption = await apiClient<InterruptionItem>(
        `/api/workspaces/${workspaceId}/artifacts/${artifactId}/podcast/interrupt`,
        {
          method: "POST",
          body: JSON.stringify({
            question: q,
            timestamp: savedResumeTime,
          }),
        }
      );

      setInterruptions((prev) => [...prev, interruption]);
      setUserQuestion("");
      setIsInterruptModalOpen(false);

      // Play the interruption audio immediately
      if (interruption.audioUrl && audioRef.current) {
        setActiveInterruption(interruption);
        audioRef.current.src = interruption.audioUrl;
        audioRef.current.currentTime = 0;
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to generate host response. Please try again.";
      setInterruptError(msg);
    } finally {
      setIsSubmittingInterrupt(false);
    }
  };

  // Skip active interruption and resume main podcast immediately
  const handleSkipInterruption = () => {
    if (!audioRef.current) return;
    setActiveInterruption(null);
    if (mainAudioUrl) {
      audioRef.current.src = mainAudioUrl;
      audioRef.current.currentTime = savedResumeTime;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  // Replay a specific interruption from the transcript
  const handlePlayInterruption = (item: InterruptionItem) => {
    if (!item.audioUrl || !audioRef.current) return;
    if (audioRef.current) {
      setSavedResumeTime(audioRef.current.currentTime);
      setActiveInterruption(item);
      audioRef.current.src = item.audioUrl;
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
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
      <audio
        ref={audioRef}
        src={activeInterruption?.audioUrl || mainAudioUrl || undefined}
        preload="metadata"
      />

      {/* Podcast Audio Player Hero Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-md space-y-4">
        {/* Header & Status */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary text-primary-foreground">
              <AudioLinesIcon size={20} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                {podcast.topic || "AI Deep-Dive Debate Podcast"}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Hosted by <strong>Alex</strong> (Analyst) & <strong>Jordan</strong> (Challenger)
              </p>
            </div>

          </div>

          <div className="flex items-center gap-1.5">
            {/* Live Interrupt & Ask Action Button */}
            {artifactId && workspaceId && (
              <Button
                variant="default"
                size="xs"
                onClick={handleOpenInterrupt}
                className="gap-1.5 text-xs font-semibold shadow-xs bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-all cursor-pointer rounded-lg"
                title="Pause episode and ask Alex & Jordan a question"
              >
                <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                <span>Interrupt &amp; Ask</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="xs"
              onClick={copyTranscript}
              className="gap-1 text-xs cursor-pointer"
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

            {mainAudioUrl && (
              <a
                href={mainAudioUrl}
                download="chaibook-debate-podcast.mp3"
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="outline" size="xs" className="gap-1 text-xs cursor-pointer">
                  <Download className="w-3.5 h-3.5" />
                  <span>MP3</span>
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Active Interruption Live Overlay */}
        {activeInterruption && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="p-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-amber-900 dark:text-amber-200 block truncate">
                  Host Q&amp;A: &ldquo;{activeInterruption.userQuestion}&rdquo;
                </span>
                <span className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                  Alex &amp; Jordan answering listener question • Resuming show next
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSkipInterruption}
              className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-100 rounded-lg text-[11px] font-medium transition-colors shrink-0 cursor-pointer"
            >
              Resume Episode
            </button>
          </div>
        )}

        {/* Animated Sound Wave Visualizer */}
        <div className="h-10 w-full bg-secondary/50 rounded-xl flex items-center justify-center gap-1 px-4 overflow-hidden border border-border/60">
          {Array.from({ length: 32 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-1 rounded-full transition-all duration-150",
                activeInterruption
                  ? "bg-amber-600 dark:bg-amber-400"
                  : "bg-primary/70",
                isPlaying ? "animate-pulse" : "opacity-40"
              )}
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
            disabled={!mainAudioUrl && !activeInterruption}
            className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50"
          />
          <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>
              {activeInterruption
                ? `Q&A (${formatTime(duration)})`
                : duration > 0
                ? formatTime(duration)
                : podcast.durationEstimate || "~1:00"}
            </span>
          </div>
        </div>

        {/* Player Controls Bar */}
        <div className="flex items-center justify-between pt-1">
          {/* Volume toggle */}
          <button
            type="button"
            onClick={toggleMute}
            disabled={!mainAudioUrl && !activeInterruption}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Center Playback Controls */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => skipTime(-10)}
              disabled={!mainAudioUrl && !activeInterruption}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
              title="Rewind 10 seconds"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              disabled={!mainAudioUrl && !activeInterruption}
              className="p-3.5 bg-primary text-primary-foreground hover:opacity-90 rounded-full transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
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
              disabled={!mainAudioUrl && !activeInterruption}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
              title="Fast forward 10 seconds"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Speed Toggle */}
          <button
            type="button"
            onClick={cyclePlaybackRate}
            disabled={!mainAudioUrl && !activeInterruption}
            className="px-2 py-1 text-xs font-mono font-semibold text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 rounded-md border border-border transition-colors disabled:opacity-40 cursor-pointer"
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

      {/* Interactive Multi-Speaker Debate Transcript with Interruption Badges */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Debate Transcript ({turns.length} Exchanges)
          </h4>
          {interruptions.length > 0 && (
            <Badge variant="outline" className="text-[10px] gap-1">
              <Radio className="w-3 h-3 text-red-500" />
              <span>{interruptions.length} Listener Q&amp;A</span>
            </Badge>
          )}
        </div>

        <div className="space-y-3">
          {turns.map((turn, index) => {
            const isAlex = turn.speaker === "Alex";
            // Check if any interruption happened around this point
            const matchingInterruption = interruptions.find(
              (it) => Math.floor(it.timestamp / 10) === index
            );

            return (
              <React.Fragment key={index}>
                <div
                  className={cn(
                    "p-4 rounded-2xl border transition-all",
                    isAlex
                      ? "bg-card border-border/80 ml-0 mr-4 sm:mr-8"
                      : "bg-secondary/50 border-border/60 ml-4 sm:ml-8 mr-0"
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "p-1 rounded-full text-[10px] font-bold",
                          isAlex
                            ? "bg-primary text-primary-foreground"
                            : "bg-foreground text-background"
                        )}
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

                {/* Render interruption card if one was asked here */}
                {matchingInterruption && (
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2 mx-2 sm:mx-4 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-200 font-semibold">
                        <MessageCircleQuestion className="w-3.5 h-3.5" />
                        <span>Listener Interruption ({formatTime(matchingInterruption.timestamp)})</span>
                      </div>
                      {matchingInterruption.audioUrl && (
                        <button
                          type="button"
                          onClick={() => handlePlayInterruption(matchingInterruption)}
                          className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-100 rounded-md font-medium text-[11px] transition-colors cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Replay Q&amp;A</span>
                        </button>
                      )}
                    </div>
                    <p className="italic text-foreground font-medium pl-5">
                      &ldquo;{matchingInterruption.userQuestion}&rdquo;
                    </p>
                    <div className="pl-5 space-y-1 pt-1 border-t border-amber-500/20">
                      {matchingInterruption.dialogue.map((d, dIdx) => (
                        <p key={dIdx} className="text-[11px] text-foreground/80">
                          <strong>{d.speaker}:</strong> {d.text}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* "Ask the Hosts" Interruption Modal */}
      {isInterruptModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4 animate-fadeIn text-foreground">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Interrupt &amp; Ask the Hosts
                  </h3>
                  <span className="text-[11px] text-muted-foreground">
                    Paused at {formatTime(savedResumeTime)} • Alex &amp; Jordan will address you live
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsInterruptModalOpen(false)}
                disabled={isSubmittingInterrupt}
                className="text-muted-foreground hover:text-foreground text-xs p-1 cursor-pointer disabled:opacity-40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick suggested questions */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground block">
                Suggested questions from your notes:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_INTERRUPTIONS.map((sq, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={isSubmittingInterrupt}
                    onClick={() => {
                      setUserQuestion(sq);
                      handleSendInterruption(sq);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg border border-border bg-secondary/50 hover:bg-secondary text-foreground text-left transition-colors cursor-pointer disabled:opacity-40"
                  >
                    {sq}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom question input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendInterruption();
              }}
              className="space-y-3 pt-2"
            >
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Or ask your own question:
                </label>
                <textarea
                  rows={3}
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  placeholder="e.g., Wait, does this work with multimodal embeddings?"
                  disabled={isSubmittingInterrupt}
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none disabled:opacity-50"
                  autoFocus
                />
              </div>

              {interruptError && (
                <p className="text-xs text-destructive bg-destructive/10 p-2 rounded-lg border border-destructive/20">
                  {interruptError}
                </p>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSubmittingInterrupt}
                  onClick={() => setIsInterruptModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  disabled={isSubmittingInterrupt || !userQuestion.trim()}
                  className="text-xs font-semibold gap-1.5 bg-primary text-primary-foreground hover:opacity-90"
                >
                  {isSubmittingInterrupt ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Alex &amp; Jordan researching...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Ask Co-Hosts</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
