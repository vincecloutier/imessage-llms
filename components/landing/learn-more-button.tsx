"use client"
import { Button } from "@/components/ui/button";

export function LearnMoreButton() {
  const scrollToFeatures = () => {
    const featureSection = document.getElementById("features");
    if (featureSection) {
      featureSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Button
      variant="ghost"
      className="mt-12 text-neutral-300 hover:text-white group"
      onClick={scrollToFeatures}
    >
      Learn more{" "}
      <span className="ml-2 transition-transform group-hover:translate-y-1">↓</span>
    </Button>
  );
}