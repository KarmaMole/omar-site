"use client";

import Link from "next/link";

export default function ReorderLink() {
  return (
    <div
      style={{
        padding: "16px 24px",
        marginBottom: "16px",
        background: "var(--theme-elevation-50)",
        borderRadius: "4px",
        border: "1px solid var(--theme-elevation-150)",
      }}
    >
      <Link
        href="/admin/reorder"
        style={{
          color: "var(--theme-text)",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "14px",
        }}
      >
        <span style={{ fontSize: "18px" }}>↕</span>
        <span>Reorder Work & Studio Items</span>
        <span style={{ marginLeft: "auto", opacity: 0.5, fontSize: "12px" }}>
          Drag & drop interface →
        </span>
      </Link>
    </div>
  );
}
