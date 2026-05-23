"use client"

import React, { createContext, useContext, useState, FC, ReactNode } from "react"

interface BeatLibraryContextType {
    currentIndex: number
    setCurrentIndex: React.Dispatch<React.SetStateAction<number>>
}

const BeatLibraryContext = createContext<BeatLibraryContextType | undefined>(undefined)

export const BeatLibraryProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [currentIndex, setCurrentIndex] = useState(0)

    return (
        <BeatLibraryContext.Provider value={{ currentIndex, setCurrentIndex }}>
            {children}
        </BeatLibraryContext.Provider>
    )
}

export const useBeatLibrary = () => {
    const context = useContext(BeatLibraryContext)
    if (!context) {
        throw new Error("useBeatLibrary must be used within a BeatLibraryProvider")
    }
    return context
}
