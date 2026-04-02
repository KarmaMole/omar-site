import "@payloadcms/next/css";
import type React from "react";
import "./custom.scss";

export const metadata = {
  title: "Admin — Omar Kamel",
};

export default function PayloadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
