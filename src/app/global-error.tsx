"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="ja">
      <body style={{ backgroundColor: "#fff", color: "#171717", fontFamily: "sans-serif" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "1rem",
          }}
        >
          <h1 style={{ fontSize: "5rem", fontWeight: "bold", color: "#d03838", margin: 0 }}>
            エラー
          </h1>
          <h2
            style={{
              marginTop: "1.5rem",
              fontSize: "1.875rem",
              fontWeight: "600",
              color: "#171717",
            }}
          >
            問題が発生しました
          </h2>
          <p style={{ marginTop: "0.75rem", color: "#666", textAlign: "center" }}>
            申し訳ございません。エラーが発生しました。
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: "2rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              borderRadius: "0.375rem",
              backgroundColor: "#0e60b2",
              padding: "1rem 2rem",
              fontSize: "1.125rem",
              fontWeight: "500",
              color: "white",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              transition: "all 0.3s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#094480";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#0e60b2";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <RefreshCw size={20} />
            再試行
          </button>
        </div>
      </body>
    </html>
  );
}
