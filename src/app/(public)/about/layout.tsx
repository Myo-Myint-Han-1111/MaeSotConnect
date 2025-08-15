import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about JumpStudy.org and our mission to connect people with educational opportunities in Thailand",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}