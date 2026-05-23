import React from "react";
import { Syne } from "next/font/google";

const syne = Syne({ subsets: ["latin"], weight: "800" });

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
        color: "inherit",
        padding: 24,
        textAlign: "center",
      }}
    >
      <h1 className={syne.className} style={{ fontSize: "3rem", letterSpacing: 1 }}>
        not found
      </h1>
    </div>
  );
}
