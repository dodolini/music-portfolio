"use client"

import React, { FC, useState, useEffect, useRef } from "react"
import { Beat } from "../../../[locale]/panel/beats/page"
import { Syne } from "next/font/google"
import Image from "next/image"
import HeroPlayer from "./HeroPlayer"
import AudioVizPlayer from "../../waveform"
import MusicLoader from "../../loader"
import { motion, useScroll, useTransform } from "motion/react"
import {MotionValue} from "motion";

const syne = Syne({ subsets: ["latin"], weight: "800" })

interface HeroProps {
    beats: Beat[],
    scrollYProgress: MotionValue<number>;
}

const Hero: FC<HeroProps> = ({ beats, scrollYProgress }) => {
    const [activeIndex, setActiveIndex] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isReady, setIsReady] = useState(false)
    const [fadeLoader, setFadeLoader] = useState(false)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    const { scrollY } = useScroll()
    // parallax movement
    const yImage = useTransform(scrollY, [0, 1000], [0, -170]) // image moves faster
    const yPlayer = useTransform(scrollY, [0, 500], [0, -50]) // player slower
    const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85])
    const rotate = useTransform(scrollYProgress, [0, 1], [0, -6])

    const headers = Array.from({ length: 4 }, (_, i) => ({
        text: "neumy beats",
        opacity: 1 - i * 0.1,
    }))

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prevIndex) => (prevIndex + 1) % headers.length)
        }, 1000)
        return () => clearInterval(interval)
    }, [headers.length])

    useEffect(() => {
        if (isReady) {
            setTimeout(() => setFadeLoader(true), 500)
        }
    }, [isReady])

    return (
        <motion.section className="sticky top-0 w-screen h-screen bg-[var(--primary-red)] border-1 border-transparent" style={{scale, rotate}}>
            {/* --- MAIN CONTENT --- */}
            <div>
                {/* Image with parallax */}
                <motion.div
                    className="absolute top-30 right-30 z-[50]"
                    style={{ y: yImage }}
                >
                    <Image
                        src="/hero-img.png"
                        alt="Hero Image"
                        width={950}
                        height={950}
                        style={{ objectFit: "cover", position: "relative", zIndex: 50 }}
                    />
                </motion.div>

                {/* Headers */}
                <div className="ml-14 mt-4 relative z-[30]">
                    {headers.map((header, idx) => (
                        <h1
                            key={idx}
                            className={`
                                uppercase ${syne.className}
                                text-stroke text-stroke-white
                                ${idx === activeIndex ? "text-white" : "text-transparent"}
                                transition-colors duration-300 ease-in-out
                                display-block
                            `}
                            style={{
                                opacity: header.opacity,
                                fontSize: "14rem",
                                lineHeight: "10rem",
                                WebkitTextStrokeWidth: "2px",
                                WebkitTextStrokeColor: "white",
                            }}
                        >
                            {header.text}
                        </h1>
                    ))}
                </div>

                {/* Player with parallax */}
                <motion.div style={{ y: yPlayer }}>
                    <HeroPlayer
                        initialBeats={beats}
                        isPlaying={isPlaying}
                        setIsPlaying={setIsPlaying}
                        audioRef={audioRef}
                        setIsReady={setIsReady}
                        isReady={isReady}
                    />
                </motion.div>

                {isPlaying && (
                    <AudioVizPlayer audioRef={audioRef} isPlaying={isPlaying} />
                )}
            </div>

            {/* --- LOADER OVERLAY --- */}
            <div
                className={`
                    fixed top-0 left-0 w-full h-full bg-black flex items-center justify-center z-[999]
                    transition-opacity duration-[1000ms] ease-in-out
                    ${fadeLoader ? "opacity-0 pointer-events-none" : "opacity-100"}
                `}
            >
                <MusicLoader />
            </div>
        </motion.section>
    )
}

export default Hero
