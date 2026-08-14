import { Metadata } from "next";
import { AuthLayout } from "@/features/auth";

export const metadata: Metadata = {
  title: "Log in - OpenBook",
  description: "Access your OpenBook workspaces, documents, and notes.",
};

export default function LoginPage() {
  return <AuthLayout mode="login" />;
}
