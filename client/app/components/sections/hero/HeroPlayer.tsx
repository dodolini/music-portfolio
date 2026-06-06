"use client";

import React, {FC, useEffect, useState, RefObject, useRef, useMemo} from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faBackward, faForward, faPlay, faPause, faVolumeHigh} from "@fortawesome/free-solid-svg-icons";
import { Beat } from "../../../[locale]/panel/beats/page";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { useInView, motion } from "framer-motion";
import {useBeatLibrary} from "../../../context/beatsContext";

interface HeroPlayerProps {
    initialBeats: Beat[];
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;
    audioRef: RefObject<HTMLAudioElement | null>;
    setIsReady: (ready: boolean) => void;
    isReady: boolean;
}

const StickyPlayer: FC<{
    currentBeat: Beat;
    isPlaying: boolean;
    setIsPlaying: (v: boolean) => void;
    handlePrev: () => void;
    handleNext: () => void;
    handleSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
    currentTime: number;
    duration: number;
    locale: "pl" | "en";
    apiBase: string;
    visible: boolean;
    isReady: boolean;
    volume: number;
    setVolume: (v: number) => void;
}> = ({
          currentBeat,
          isPlaying,
          setIsPlaying,
          handlePrev,
          handleNext,
          handleSeek,
          currentTime,
          duration,
          locale,
          apiBase,
          visible,
          isReady, volume, setVolume
      }) => {
    return createPortal(
        <motion.div
            animate={{ y: visible && isReady ? 0 : 100, opacity: visible && isReady ? 1 : 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="fixed bottom-0 left-0 w-full bg-black text-white shadow-[0_-8px_30px_rgba(0,0,0,0.6),0_-1px_4px_rgba(255,255,255,0.1)] z-[9999] p-3"
        >
            <div className="flex items-center justify-between max-w-5xl mx-auto w-full relative">
                <div className="flex items-center space-x-4">
                    <div className="w-[60px] h-[60px] overflow-hidden rounded-md flex-shrink-0">
                        <Image
                            src={
                                currentBeat.imageUrl
                                    ? currentBeat.imageUrl.startsWith("http")
                                        ? currentBeat.imageUrl
                                        : `${apiBase}${currentBeat.imageUrl}`
                                    : "/hero-img.png"
                            }
                            alt={currentBeat.name[locale] || currentBeat.name.en}
                            width={60}
                            height={60}
                            className="object-cover w-full h-full"
                        />
                    </div>
                    <div className="min-w-0">
                        <div className="text-sm font-semibold truncate max-w-[220px]">
                            {currentBeat.name[locale] || currentBeat.name.en}
                        </div>
                        <div className="text-xs text-gray-300">
                            {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, "0")} /{" "}
                            {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, "0")}
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <button onClick={handlePrev} className="text-lg hover:text-red-500 transition-colors">
                        <FontAwesomeIcon icon={faBackward} />
                    </button>

                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="text-2xl hover:text-red-500 transition-colors"
                    >
                        <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
                    </button>

                    <button onClick={handleNext} className="text-lg hover:text-red-500 transition-colors">
                        <FontAwesomeIcon icon={faForward} />
                    </button>

                    {/* volume */}
                    <div className="flex items-center gap-2 ml-10">
                        <FontAwesomeIcon
                            icon={faVolumeHigh}
                            className="text-gray-300 text-sm"
                        />

                        <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={volume}
                            onChange={(e) => setVolume(Number(e.target.value))}
                            className="
                                w-20 h-1
                                bg-gray-600 rounded-full
                                appearance-none cursor-pointer
                                accent-cyan-300
                            "
                        />
                    </div>
                </div>

            </div>

            <div
                className="w-full h-1 cursor-pointer bg-gray-600 rounded-full mt-3 max-w-5xl mx-auto relative"
                onClick={handleSeek}
            >
                <div
                    className="absolute h-full rounded-full bg-cyan-300"
                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
            </div>
        </motion.div>,
        document.body
    )
}

const HeroPlayer: FC<HeroPlayerProps> = ({ initialBeats, isPlaying, setIsPlaying, audioRef, setIsReady, isReady }) => {
    // Cloudinary returns absolute https URLs; apiBase only prefixes any legacy
    // relative paths, which now resolve against the same origin.
    const apiBase = "";
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const { currentIndex, setCurrentIndex } = useBeatLibrary()
    const t = useTranslations("player");
    const locale = useLocale() as "pl" | "en";
    const playerRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    const beats = useMemo(
        () => Array(3).fill(initialBeats).flat(),
        [initialBeats]
    )

    useEffect(() => {
        const timer = setTimeout(() => {
            setMounted(true);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const isInView = useInView(playerRef, { amount: 0.01 });

    useEffect(() => {
        if (!beats || beats.length === 0) return;
        const mainIndex = beats.findIndex((beat) => beat.main);
        setCurrentIndex(mainIndex !== -1 ? mainIndex : 0);
    }, [beats]);

    const currentBeat = beats[currentIndex] || null;

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
            if (audio.duration && audio.duration > 0) setIsReady(true);
        };

        setIsReady(false);
        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.load();

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        };
    }, [audioRef, currentIndex, setIsReady]);


    const updatePlayCount = async (beatId: string) => {
        const playedBeats = JSON.parse(
            sessionStorage.getItem("playedBeats") || "[]"
        );

        // prevent multiple increments in one session
        if (playedBeats.includes(beatId)) return;

        try {
            await fetch(`/api/beats/${beatId}/play`, {
                method: "POST",
            });

            // save beat as already counted
            sessionStorage.setItem(
                "playedBeats",
                JSON.stringify([...playedBeats, beatId])
            );
        } catch (error) {
            console.error("Error updating play count:", error);
        }
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.volume = volume;
        if (isPlaying) {
            audio.play();
            if (currentBeat?.id) {
                updatePlayCount(currentBeat.id).then(r => true);
            }
        } else audio.pause();
    }, [isPlaying, audioRef, volume, currentBeat]);

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!audioRef.current) return;
        const progress = e.nativeEvent.offsetX / e.currentTarget.offsetWidth;
        audioRef.current.currentTime = progress * duration;
    };

    const handlePrev = () => {
        if (!beats.length) return;
        setCurrentIndex((prev) => (prev - 1 + beats.length) % beats.length);
        setIsPlaying(true);
    };

    const handleNext = () => {
        if (!beats.length) return;
        setCurrentIndex((prev) => (prev + 1) % beats.length);
        setIsPlaying(true);
    };

    if (!currentBeat) return null;

    return (
        <>
            {/* Full player */}
            <div
                ref={playerRef}
                className="mt-30 ml-50 relative w-[400px] flex flex-col bg-black text-white shadow-[8px_8px_0px_0px_cyan] p-6 z-60"
            >
                <div className="flex flex-row mb-4">
                    <div className="flex-1 flex items-center justify-center w-[150px] h-[150px] overflow-hidden">
                        <Image
                            src={
                                currentBeat.imageUrl
                                    ? currentBeat.imageUrl.startsWith("http")
                                        ? currentBeat.imageUrl
                                        : `${apiBase}${currentBeat.imageUrl}`
                                    : "/hero-img.png"
                            }
                            alt={currentBeat.name[locale] || currentBeat.name.en}
                            width={150}
                            height={150}
                            className="object-cover"
                        />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                        <h2 className="text-3xl font-bold uppercase tracking-widest text-center mb-4">
                            {currentBeat.name[locale] || currentBeat.name.en}
                        </h2>

                        <div
                            className="w-full h-2 cursor-pointer bg-gray-600 rounded-full mb-2 relative"
                            onClick={handleSeek}
                        >
                            <div
                                className="absolute h-full rounded-full bg-cyan-300"
                                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                            />
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm">
                            {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, "0")}
                          </span>
                            <div className="flex items-center space-x-6">
                                <button onClick={handlePrev} className="text-2xl hover:text-red-500 transition-colors">
                                    <FontAwesomeIcon icon={faBackward} />
                                </button>
                                <button onClick={() => setIsPlaying(!isPlaying)} className="text-4xl hover:text-red-500 transition-colors">
                                    <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
                                </button>
                                <button onClick={handleNext} className="text-2xl hover:text-red-500 transition-colors">
                                    <FontAwesomeIcon icon={faForward} />
                                </button>
                            </div>
                            <span className="text-sm">
                            {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, "0")}
                          </span>
                        </div>
                    </div>

                </div>
                <div className="flex items-center gap-3 mt-4">
                    <FontAwesomeIcon
                        icon={faVolumeHigh}
                        className="text-gray-300 text-sm"
                    />

                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer accent-cyan-300"
                    />
                </div>

                <audio
                    ref={audioRef}
                    src={
                        currentBeat.fileUrl.startsWith("http") ? currentBeat.fileUrl : `${apiBase}${currentBeat.fileUrl}`
                    }
                    crossOrigin="anonymous"
                />
            </div>

            {mounted && (
                <StickyPlayer
                    currentBeat={currentBeat}
                    isPlaying={isPlaying}
                    setIsPlaying={setIsPlaying}
                    handlePrev={handlePrev}
                    handleNext={handleNext}
                    handleSeek={handleSeek}
                    currentTime={currentTime}
                    duration={duration}
                    locale={locale}
                    apiBase={apiBase}
                    visible={!isInView}
                    isReady={isReady}
                    volume={volume}
                    setVolume={setVolume}
                />
            )}
        </>
    );
};

export default HeroPlayer;
