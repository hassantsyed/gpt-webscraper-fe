import { useAuth } from "@/components/context/authContext";
import { useRouter } from "next/router";
import { useEffect } from "react";
import GoogleButton from "react-google-button";
import Image from "next/image";

export default function Login() {
  const router = useRouter();
  const { authUser, signIn, userLoading } = useAuth();

  useEffect(() => {
    if (!userLoading && authUser) {
      router.push("/scrape/list");
    }
  }, [userLoading, authUser, router]);

  const handleSignIn = async () => {
    try {
      const user = await signIn();
      if (user) {
        router.push("/scrape/list");
      }
    } catch (err) {
      console.error("Sign in error:", err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-md shadow-sm text-center">
        <h1 className="text-3xl font-semibold mb-6 text-gray-700">Welcome to Scrape Wizard</h1>
        <div className="flex justify-center">
          <GoogleButton
            onClick={handleSignIn}
            className="hover:bg-gray-50 transition-colors duration-300"
          />
        </div>
      </div>
    </div>
  );
}
