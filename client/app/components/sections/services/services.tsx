"use client"

import { motion, useTransform } from "motion/react"
import React from "react"
import {MotionValue} from "motion";
import {Syne} from "next/font/google";
import {useScroll} from "framer-motion";
import {useTranslations} from "next-intl";

interface Service {
    id: number
    title: string
    img: string
}

interface ServicesParallaxProps {
    scrollY: MotionValue<number>;
}

const syne = Syne({ subsets: ["latin"], weight: "800" })

export const ServicesParallax: React.FC<ServicesParallaxProps> = ({scrollY}) => {
    const t = useTranslations('services');
    const [isMobile, setIsMobile] = React.useState(false)
    React.useEffect(() => {
        const check = () => setIsMobile(typeof window !== 'undefined' && window.innerWidth < 1024)
        check()
        window.addEventListener('resize', check)
        return () => window.removeEventListener('resize', check)
    }, [])

    const scale = useTransform(scrollY, [0, 1], [0.8, 1])
    const rotate = useTransform(scrollY, [0, 1], [-6, 0])
    const opacity = useTransform(scrollY, [0, 0.99, 1], [0, 0, 1])

    const services: Service[] = [
        {
            id: 1,
            title: t("production"),
            img: "building_1.jpg",
        },
        {
            id: 2,
            title: t("mix"),
            img: "building_2.png",
        },
        {
            id: 3,
            title: t("consulting"),
            img: "building_3.jpg",
        },
    ]

    const servicesRef = React.useRef(null)
    const {scrollYProgress} = useScroll({
        target: servicesRef,
        offset: ["start end", "end end"],
    })
    const moveUp = useTransform(scrollYProgress, [0, 1], [0, -400])

    return (
        <motion.div
            ref={servicesRef}
            className={`relative w-full ${isMobile ? 'h-auto' : 'h-[190vh]'} bg-black overflow-visible`}
            style={{ scale: isMobile ? 1 : scale, rotate: isMobile ? 0 : rotate }}
        >
            {isMobile ? (
                <div className="w-full py-10 px-4 flex flex-col gap-10">
                    {services.map((s) => (
                        <div key={s.id} className="w-full">
                            <div
                                className="w-full h-64 md:h-80 bg-center bg-cover rounded-md"
                                style={{ backgroundImage: `url(${s.img})` }}
                            />
                            <div className={`mt-3 text-[var(--primary-red)] text-2xl uppercase ${syne.className}`}>{s.title}</div>
                        </div>
                    ))}
                </div>
            ) : (
                <motion.div
                    className={'relative h-[100%] w-[100%]'}
                    style={{
                        'transition': 'opacity 0.3s ease-in-out',
                        opacity
                    }}
                >
                    {/*First service*/}
                    <div className={'absolute top-0 bottom-0 left-[20%] w-[2px] bg-gray-400 z-100'}/>
                    <motion.div
                        className={'relative top-[25%] h-[400px] left-[10%] w-[450px] z-101'}
                        style={{
                            backgroundImage: `url(${services[0].img})`,
                            backgroundPosition: `0% ${moveUp}px`,
                            backgroundRepeat: 'no-repeat',
                            backgroundAttachment: 'fixed',
                            top: `calc(${moveUp}px + 15%)`,
                        }}
                    >
                        <div className={`absolute top-[10%] left-[70%] text-[var(--primary-red)] text-[40px] uppercase ${syne.className} whitespace-nowrap`}>{services[0].title}</div>
                    </motion.div>

                    {/*Second service*/}
                    <div className={'absolute top-0 bottom-0 right-[25%] w-[1px] bg-gray-400 z-100'}/>
                    <div
                        className={'absolute top-[40%] h-[350px] right-[15%] w-[350px] z-101'}
                        style={{
                            backgroundImage: `url(${services[1].img})`,
                            backgroundPosition: `100%`,
                            backgroundRepeat: 'no-repeat',
                            backgroundAttachment: 'fixed',
                            backgroundSize: 'contain',
                            top: `calc(${moveUp}px + 15%)`,
                        }}
                    >
                        <div className={`absolute bottom-[30%] right-[65%] text-[var(--primary-red)] text-[40px] uppercase ${syne.className} whitespace-nowrap`}>{services[1].title}</div>
                    </div>

                    {/*Third service*/}
                    <div
                        className={'absolute top-[70%] h-[400px] left-[10%] w-[450px] z-101'}
                        style={{
                            backgroundImage: `url(${services[2].img})`,
                            backgroundPosition: `0% ${moveUp}px`,
                            backgroundRepeat: 'no-repeat',
                            backgroundAttachment: 'fixed',
                        }}
                    >
                        <div className={'relative w-[100%] h-[100%]'}>
                            <div className={`absolute top-[10%] left-[70%] text-[var(--primary-red)] text-[40px] uppercase ${syne.className} whitespace-nowrap`}>{services[2].title}</div>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    )
}