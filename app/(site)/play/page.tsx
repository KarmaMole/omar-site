import type { Metadata } from "next";
import TronGame from "@/components/tron-game";

export const metadata: Metadata = {
  title: "Grid Override",
  description: "Enter the grid. Outlast your opponents. Unlock access.",
  robots: { index: false, follow: false },
};

export default function PlayPage() {
  return <TronGame />;
}
