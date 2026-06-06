"use client"

import React from 'react';
import Hero from "./hero/Hero";
import {Beat} from "../../[locale]/panel/beats/page";
import {useScroll} from "framer-motion";
import {ServicesParallax} from "./services/services";

interface MainSectionProps {
    initialBeats: Beat[];
}

const MainSection: React.FC<MainSectionProps> = ({initialBeats}) => {
    const containerRef = React.useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    })
    
    return (
        <main className={'relative h-auto lg:h-[200vh]'} ref={containerRef}>
            <Hero
                beats={initialBeats}
                scrollYProgress={scrollYProgress}
            />
            <ServicesParallax scrollY={scrollYProgress}/>
        </main>
    )
};

export default MainSection;