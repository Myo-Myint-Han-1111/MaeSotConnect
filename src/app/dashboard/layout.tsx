// import { redirect } from "next/navigation";
import AdminLayout from "../admin/layout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
