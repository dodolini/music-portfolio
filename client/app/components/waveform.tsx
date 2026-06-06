"use client";

import React, { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { motion, useScroll, useTransform } from "framer-motion";
import {initAudio} from "../context/audioContext";

interface AudioVizPlayerProps {
    audioRef: React.RefObject<HTMLAudioElement | null>;
    isPlaying: boolean;
}

function SphereVisualizer({
                              analyser,
                              isPlaying,
                          }: {
    analyser: AnalyserNode | null;
    isPlaying: boolean;
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);

    useEffect(() => {
        if (analyser) {
            dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
        }
    }, [analyser]);

    useFrame(() => {
        if (!meshRef.current) return;

        meshRef.current.rotation.x += 0.002;
        meshRef.current.rotation.y += 0.003;

        if (!analyser || !dataArrayRef.current || !isPlaying) return;
        analyser.getByteFrequencyData(dataArrayRef.current);
        const avg =
            dataArrayRef.current.reduce((a, b) => a + b, 0) /
            dataArrayRef.current.length /
            256;

        const scale = 1 + avg;
        meshRef.current.scale.set(scale, scale, scale);
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[1, 10, 10]} />
            <meshStandardMaterial color="rgba(0,255,255)" wireframe />
        </mesh>
    );
}

export default function AudioVizPlayer({
                                           audioRef,
                                           isPlaying,
                                       }: AudioVizPlayerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

    const { scrollYProgress } = useScroll();
    const dynamicHeight = useTransform(scrollYProgress, [0, 0.3, 1], [460, 50, 0]);

    const renderBars = () => {
        const canvas = canvasRef.current;
        const analyser = analyserRef.current;
        if (!canvas || !analyser) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const barWidth = (canvas.width / bufferLength) * 3.5;
        const barSpacing = 4;
        const center = bufferLength / 2;

        const draw = () => {
            if (!isPlaying) return;
            analyser.getByteFrequencyData(dataArray);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            let x = 0;
            for (let i = 0; i < bufferLength; i++) {
                const distanceFromCenter = Math.abs(i - center) / center;
                const scale = 1 - distanceFromCenter * 0.9;
                const barHeight = dataArray[i] * 1.4 * scale;

                ctx.fillStyle = "rgba(255,255,255,0.45)";
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

                x += barWidth + barSpacing;
            }
            animationRef.current = requestAnimationFrame(draw);
        };

        draw();
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const { audioCtx, analyser } = initAudio(audio);

        analyserRef.current = analyser;

        if (isPlaying) {
            if (audioCtx.state === "suspended") {
                audioCtx.resume();
            }
            renderBars();
        } else if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }

    }, [isPlaying]);

    if (!isPlaying) return null;

    return (
        <>
            {/* Sphere in the center */}
            <div
                className="absolute top-1/2 left-1/5 -translate-y-1/2 pointer-events-none w-[2000px] h-[2000px]"
                style={{ zIndex: 0 }}
            >
                <Canvas style={{ pointerEvents: "none" }}>
                    <ambientLight />
                    <pointLight position={[200, 200, 200]} />
                    <SphereVisualizer analyser={analyserRef.current} isPlaying={isPlaying} />
                </Canvas>
            </div>

            {/* Bars at the bottom */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 z-50"
                style={{
                    background:
                        "linear-gradient(to top, rgba(0,255,255,0.3), rgba(0,255,255,0))",
                    height: dynamicHeight,
                }}
            >
                <canvas
                    ref={canvasRef}
                    width={typeof window !== "undefined" ? window.innerWidth : 1920}
                    height={200}
                    className="w-full h-full"
                />
            </motion.div>
        </>
    );
}
