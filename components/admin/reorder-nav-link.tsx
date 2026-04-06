"use client";

import Link from "next/link";

export default function ReorderNavLink() {
  return (
    <Link
      href="/admin/reorder"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 16px",
        color: "var(--theme-text)",
        textDecoration: "none",
        fontSize: "13px",
        borderRadius: "4px",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "var(--theme-elevation-100)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <span style={{ fontSize: "15px" }}>&#x2195;</span>
      <span>Reorder Items</span>
    </Link>
  );
}
