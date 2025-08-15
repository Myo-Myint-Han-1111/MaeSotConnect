import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Courses",
  description: "Browse educational courses and training programs in Thailand",
};

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}