"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  PiLinkedinLogo,
  PiInstagramLogo,
  PiClock,
  PiMapPin,
} from "react-icons/pi";
import { SiLemonsqueezy } from "react-icons/si";

export default function Footer() {
  const [time, setTime] = useState("");
  const [city, setCity] = useState("Loading...");

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch city silently (IP-based)
  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => setCity(data.city))
      .catch(() => setCity("Somewhere 🌍"));
  }, []);

  return (
    <footer className="w-full bg-black flex flex-col md:flex-row items-center justify-between gap-4 py-6 px-6 text-gray-400 text-xs border-t border-gray-800 pb-[env(safe-area-inset-bottom)]">
      {/* LEFT: Time + City */}
      <div className="flex items-center gap-4 text-gray-500">
        <span className="flex items-center gap-1">
          <PiClock /> {time}
        </span>
        <span className="flex items-center gap-1">
          <PiMapPin /> {city}
        </span>
      </div>

      {/* CENTER: © 2025 + Icon + Title */}
      <div className="flex items-center gap-1 text-gray-500">
        © {new Date().getFullYear()}
        <SiLemonsqueezy className="text-gray-500 text-sm" />
        <span className="font-semibold text-gray-500">Squeezit</span>
      </div>

      {/* RIGHT: Social Icons */}
      <div className="flex items-center gap-4">
        <Link
          href="https://fr.linkedin.com/in/helloleandro/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white transition"
        >
          <PiLinkedinLogo className="text-xl" />
        </Link>
        <Link
          href="https://www.instagram.com/leobarbosa_____/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white transition"
        >
          <PiInstagramLogo className="text-xl" />
        </Link>
      </div>
    </footer>
  );
}
