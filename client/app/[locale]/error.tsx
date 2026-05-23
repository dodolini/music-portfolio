"use client";

import React, { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "../../i18n/navigations";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("Unhandled app error:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
        color: "inherit",
        padding: 24,
        textAlign: "center",
      }}
    >
      <div>
        <h1 style={{ fontSize: 28, marginBottom: 12 }}>{t("title")}</h1>
        <p style={{ opacity: 0.8, marginBottom: 20 }}>{t("description")}</p>
        {error?.digest && (
          <p style={{ opacity: 0.5, marginBottom: 20, fontSize: 12 }}>
            {t("errorId")}: {error.digest}
          </p>
        )}
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button
            onClick={reset}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "1px solid #1f9cf0",
              background: "#0e60a3",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            {t("tryAgain")}
          </button>
          <Link
            href={{ pathname: "/" }}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "1px solid #444",
              background: "transparent",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            {t("goHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
