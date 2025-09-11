import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about JumpStudy.org and our mission to connect people with educational opportunities in Thailand. Discover how we're empowering communities through accessible education.",
  keywords: ["about JumpStudy", "educational mission", "Thailand education", "community empowerment", "Mae Sot", "youth advocates"],
  
  openGraph: {
    title: "About JumpStudy.org",
    description: "Learn about JumpStudy.org and our mission to connect people with educational opportunities in Thailand. Discover how we're empowering communities through accessible education.",
    type: "website",
    images: [
      {
        url: "/images/JumpStudyLogo.svg",
        width: 1200,
        height: 630,
        alt: "About JumpStudy.org",
      },
    ],
  },
  
  twitter: {
    title: "About JumpStudy.org",
    description: "Learn about JumpStudy.org and our mission to connect people with educational opportunities in Thailand.",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}