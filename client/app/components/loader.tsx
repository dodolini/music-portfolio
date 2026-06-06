import React from "react";
import Lottie from "lottie-react";

type Props = {
    size?: number; // size in px
    color?: string; // (optional)
    speed?: number; // animation speed
};

import animationData from "./musical-notes.json";

const MusicLoader: React.FC<Props> = ({ size = 120, speed = 1 }) => {
    return (
        <div
            style={{
                width: size,
                height: size,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Lottie
                animationData={animationData}
                loop
                autoplay
                style={{ width: "100%", height: "100%" }}
            />

        </div>
    );
};

export default MusicLoader;
