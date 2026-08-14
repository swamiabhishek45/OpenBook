import { Metadata } from "next";
import { AuthLayout } from "@/features/auth";

export const metadata: Metadata = {
  title: "Sign up - OpenBook",
  description: "Create your OpenBook account and unlock insights with AI.",
};

export default function SignupPage() {
  return <AuthLayout mode="signup" />;
}
