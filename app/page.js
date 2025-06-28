"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://qonv-back.onrender.com";

export default function Login() {
  const [username, setUsername] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  const handleToggle = () => {
    setDarkMode((prev) => !prev);
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark", !darkMode);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      if (typeof window !== "undefined") {
        localStorage.setItem("qonvoo_username", username.trim());
      }
      router.push("/chat");
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-500 ${darkMode ? "bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#232526]" : "bg-gradient-to-br from-blue-200 via-pink-100 to-purple-200"}`}>
      <div className="absolute top-4 right-4">
        <button
          aria-label="Toggle dark mode"
          onClick={handleToggle}
          className="p-2 rounded-full shadow-lg bg-white/70 dark:bg-black/40 backdrop-blur hover:scale-110 transition-transform"
        >
          {darkMode ? (
            <span role="img" aria-label="Light mode">🌞</span>
          ) : (
            <span role="img" aria-label="Dark mode">🌙</span>
          )}
        </button>
      </div>
      <div className="flex flex-col items-center gap-8 w-full max-w-xs p-8 rounded-3xl shadow-2xl bg-white/60 dark:bg-black/40 backdrop-blur-lg border border-white/30 dark:border-black/30">
        <div className="flex flex-col items-center">
          {/* Option 1: Text Logo (Current) */}
          <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-pink-400 to-purple-500 mb-2">
            Qonvoo
          </div>
          
          {/* Option 2: Image Logo (Uncomment and replace with your logo) */}
          {/* <Image src="/qonvoo-logo.svg" alt="Qonvoo Logo" width={120} height={40} className="mb-2" /> */}
          
          <div className="text-sm text-gray-500 dark:text-gray-400">Connect with strangers worldwide</div>
        </div>
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 tracking-tight mb-4">Welcome Back</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full">
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="px-4 py-3 rounded-xl bg-white/80 dark:bg-black/30 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-pink-400 text-lg shadow-inner"
            required
            maxLength={20}
            autoFocus
          />
          <button
            type="submit"
            className="mt-2 py-3 rounded-xl bg-gradient-to-r from-blue-500 via-pink-400 to-purple-500 text-white font-semibold text-lg shadow-lg hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-pink-400"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
