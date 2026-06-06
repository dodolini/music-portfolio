"use client"

import React, { FC, useRef, useMemo } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Tilt from "react-parallax-tilt"
import { Beat } from "../../../[locale]/panel/beats/page"
import { Syne } from "next/font/google"
import { IconButton } from "rsuite"
// rsuite's IconButton props union is too large for TS to represent here.
const IconBtn = IconButton as React.FC<{
    icon: React.ReactElement
    onClick?: () => void
    className?: string
    circle?: boolean
}>
import ChevronLeftIcon from "@rsuite/icons/legacy/ChevronLeft"
import ChevronRightIcon from "@rsuite/icons/legacy/ChevronRight"
import Image from "next/image"
import { useBeatLibrary } from "../../../context/beatsContext"
import { useTranslations } from "next-intl"

interface BitLibraryProps {
    initialBeats: Beat[]
}

const syne = Syne({ subsets: ["latin"], weight: "800" })

const BitLibrary: FC<BitLibraryProps> = ({ initialBeats }) => {
    // Cloudinary returns absolute https URLs; apiBase only prefixes any legacy
    // relative paths, which now resolve against the same origin.
    const apiBase = ""

    const containerRef = useRef<HTMLDivElement>(null)

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    })

    const t = useTranslations("library")

    const scale = useTransform(
        scrollYProgress,
        [0, 0.2, 0.3, 0.45, 0.5, 1],
        [1, 1.5, 3, 10, 50, 500]
    )
    const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0, 0])
    const goDown = useTransform(scrollYProgress, [0, 1], [0, 2000])
    const carouselOpacity = useTransform(
        scrollYProgress,
        [0, 0.499, 0.5],
        [0, 0.001, 1]
    )

    const beats = useMemo(
        () => Array(3).fill(initialBeats).flat(),
        [initialBeats]
    )

    const { currentIndex, setCurrentIndex } = useBeatLibrary()

    const nextSlide = () =>
        setCurrentIndex((p) => (p + 1) % beats.length)
    const prevSlide = () =>
        setCurrentIndex((p) => (p - 1 + beats.length) % beats.length)

    const itemAngle = 360 / beats.length
    const translateZ = 400

    return (
        <div
            ref={containerRef}
            className="relative h-[200vh] mt-[90vh] bg-[var(--primary-red)] text-white overflow-hidden"
        >
            <div className="flex justify-center items-center h-full w-full">
                {/* TITLE */}
                <motion.h1
                    style={{ scale, opacity, y: goDown }}
                    className={`absolute top-[35vh] left-1/2 -translate-x-1/2 text-[6vw] font-bold uppercase pointer-events-none ${syne.className} whitespace-nowrap`}
                >
                    <span
                        className="text-transparent"
                        style={{ WebkitTextStroke: "2px white" }}
                    >
                        {t("header")}
                    </span>
                </motion.h1>

                {/* MOVING TEXT */}
                <motion.div
                    className={`absolute top-[140vh] left-0 w-full text-[6vw] font-extrabold text-white/10 uppercase tracking-[0.1em] ${syne.className} whitespace-nowrap pointer-events-none select-none`}
                    animate={{ x: ["0%", "-100%"] }}
                    transition={{
                        repeat: Infinity,
                        duration: 30,
                        ease: "linear",
                    }}
                    style={{ opacity: carouselOpacity }}
                >
                    NEUMY BEATS&nbsp;NEUMY BEATS&nbsp;NEUMY BEATS&nbsp;
                </motion.div>

                {/* CAROUSEL */}
                <motion.div
                    style={{ opacity: carouselOpacity }}
                    className="absolute top-[130vh] left-0 w-full flex justify-center items-center"
                >
                    <div className="relative w-[80%] flex flex-col items-center">
                        <IconBtn
                            icon={<ChevronLeftIcon />}
                            onClick={prevSlide}
                            className="!absolute left-[-60px] top-1/2 -translate-y-1/2 !bg-white/10 hover:!bg-white/20 !text-white !p-3 !rounded-full z-30"
                            circle
                        />
                        <IconBtn
                            icon={<ChevronRightIcon />}
                            onClick={nextSlide}
                            className="!absolute right-[-60px] top-1/2 -translate-y-1/2 !bg-white/10 hover:!bg-white/20 !text-white !p-3 !rounded-full z-30"
                            circle
                        />

                        <div style={{ perspective: "1000px" }}>
                            <div
                                style={{
                                    transform: `rotateY(${
                                        -currentIndex * itemAngle
                                    }deg)`,
                                    transformStyle: "preserve-3d",
                                    transition:
                                        "transform 1s cubic-bezier(.4,0,.2,1)",
                                    width: "300px",
                                    height: "400px",
                                }}
                            >
                                {beats.map((beat, index) => {
                                    const distance = Math.min(
                                        Math.abs(currentIndex - index),
                                        beats.length -
                                        Math.abs(currentIndex - index)
                                    )

                                    const isActive = distance === 0

                                    return (
                                        <div
                                            key={`${beat.id}-${index}`}
                                            style={{
                                                position: "absolute",
                                                width: "300px",
                                                height: "400px",
                                                transform: `rotateY(${
                                                    index * itemAngle
                                                }deg) translateZ(${translateZ}px)`,
                                                opacity: isActive ? 1 : 0.6,
                                                transition:
                                                    "opacity 0.6s ease",
                                            }}
                                        >
                                            <Tilt
                                                tiltEnable={isActive}
                                                tiltMaxAngleX={15}
                                                tiltMaxAngleY={15}
                                                perspective={1200}
                                                scale={1.05}
                                                transitionSpeed={300}
                                                glareEnable={false}
                                                className="w-full h-full"
                                                style={{ width: "100%", height: "100%" }}
                                                tiltReverse={true}
                                            >
                                                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl flex flex-col justify-end text-center">
                                                    <Image
                                                        src={
                                                            beat.imageUrl
                                                                ? beat.imageUrl.startsWith("http")
                                                                    ? beat.imageUrl
                                                                    : `${apiBase}${beat.imageUrl}`
                                                                : "/hero-img.png"
                                                        }
                                                        alt={beat.name?.pl || "Beat"}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                                    <div className="relative p-4 text-white">
                                                        <h3 className="text-lg font-semibold">
                                                            {beat.name?.pl || "Beat"}
                                                        </h3>
                                                    </div>
                                                </div>
                                            </Tilt>

                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default BitLibrary
