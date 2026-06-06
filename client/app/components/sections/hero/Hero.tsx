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
    const [isMobile, setIsMobile] = useState(false)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
        const check = () => setIsMobile(typeof window !== 'undefined' && window.innerWidth < 1024)
        check()
        window.addEventListener('resize', check)
        return () => window.removeEventListener('resize', check)
    }, [])

    const { scrollY } = useScroll()
    // parallax movement (disabled on mobile)
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
        <motion.section className={`${isMobile ? "relative h-[100vh]" : "sticky top-0 h-screen"} w-screen bg-[var(--primary-red)] border-1 border-transparent overflow-hidden`} style={{ scale: isMobile ? 1 : scale, rotate: isMobile ? 0 : rotate }}>
            {/* --- MAIN CONTENT --- */}
            <div>
                {/* Image with parallax */}
                <motion.div
                    className="absolute top-30 right-30 z-[50] hidden lg:block"
                    style={{ y: isMobile ? 0 : yImage }}
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
                <div className="ml-4 lg:ml-14 mt-4 relative z-[30]">
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
                                fontSize: isMobile ? "3rem" : "14rem",
                                lineHeight: isMobile ? "3.25rem" : "10rem",
                                WebkitTextStrokeWidth: "2px",
                                WebkitTextStrokeColor: "white",
                            }}
                        >
                            {header.text}
                        </h1>
                    ))}
                </div>

                {/* Player with parallax */}
                <motion.div style={{ y: isMobile ? 0 : yPlayer }}>
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
