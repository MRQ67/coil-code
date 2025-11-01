"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");

  const createNewRoom = () => {
    router.push(`/editor/${nanoid(10)}`);
  };

  const joinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim()) router.push(`/editor/${roomCode.trim()}`);
  };

  return (
    <main className="min-h-screen bg-[#222831] relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#DFD0B8] rounded-full opacity-10 blur-3xl -translate-y-1/2 translate-x-1/2 -z-10" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#DFD0B8] rounded-full opacity-10 blur-3xl translate-y-1/2 -translate-x-1/2 -z-10" />

      <div className="relative z-10 container mx-auto px-6 md:px-12 py-8">
        {/* Header: Logo left, GitHub right */}
        <header className="flex justify-between items-center mb-16">
          {/* Logo only - no text */}
          <div className="flex items-center">
            <Image
              src="/logo.svg"
              alt="Coil Code Logo"
              width={120}
              height={120}
              className="w-15 h-15"
            />
          </div>

          {/* GitHub button */}
          <div className="text-right">
            <p className="text-[#948979] text-sm mb-2">check it out in</p>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-[#DFD0B8] text-[#222831] px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-all duration-200"
            >
              <Image
                src="/soical_icons/github-142-svgrepo-com.svg"
                alt="GitHub"
                width={20}
                height={20}
                className="w-5 h-5"
              />
              <span>GitHub</span>
            </a>
          </div>
        </header>

        {/* Hero: 50/50 grid */}
        <div className="grid md:grid-cols-[50%_50%] gap-4 items-center min-h-[30vh]">
          <div className="space-y-1">
            {/* Hero text */}
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                Coil Code{" "}
                <Image
                  src="/inline_logo.svg"
                  alt=""
                  width={44}
                  height={44}
                  className="inline w-11 h-11 md:w-12 md:h-12 align-middle"
                />{" "}
                is a collaborative web code editor made by{" "}
                <Image
                  src="/aa3_logo.svg"
                  alt="AA3 Logo"
                  width={50}
                  height={38}
                  className="inline w-11 h-10 md:w-12 md:h-11 align-middle"
                />
              </h1>

              <div className="text-lg md:text-xl text-white space-y-2">
                <p className="flex items-center flex-wrap gap-2">
                  Built using Next.js{" "}
                  <Image
                    src="/nextjs-icon.svg"
                    alt="Next.js"
                    width={28}
                    height={28}
                    className="w-7 h-7 align-middle"
                  />
                  <span className="text-[#948979] text-sm">(frontend)</span>,
                  Yjs{" "}
                  <Image
                    src="/yjs-icon.svg"
                    alt="Yjs"
                    width={28}
                    height={28}
                    className="w-7 h-7 align-middle"
                  />
                  <span className="text-[#948979] text-sm">
                    (synchronization)
                  </span>
                  , PartyKit{" "}
                  <Image
                    src="/partykit-icon.svg"
                    alt="PartyKit"
                    width={28}
                    height={28}
                    className="w-7 h-7 align-middle"
                  />
                  <span className="text-[#948979] text-sm">(backend)</span>, and
                  it is - <strong>Powered by Monaco Editor</strong>.
                </p>
              </div>
            </div>

            {/* Create Room button */}
            <button
              onClick={createNewRoom}
              className="bg-[#DFD0B8] text-[#222831] px-8 py-2 rounded-xl text-lg font-semibold hover:transform hover:scale-105 hover:shadow-lg transition-all duration-200 flex items-center space-x-2 mt-6"
            >
              <span>Create New Room</span>
              <span>→</span>
            </button>

            {/* "or" divider */}
            <div className="flex items-center space-x-4 mt-4">
              <div className="flex-1 h-px bg-[#948979] opacity-30"></div>
              <span className="text-[#948979] text-sm">or</span>
              <div className="flex-1 h-px bg-[#948979] opacity-30"></div>
            </div>

            {/* Join room input + GO button */}
            <form onSubmit={joinRoom} className="flex space-x-3 mt-6">
              <input
                type="text"
                placeholder="Enter Room Code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="flex-1 px-4 py-1 rounded-lg bg-white text-[#222831] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#DFD0B8]"
              />
              <button
                type="submit"
                className="bg-[#948979] text-white px-6 py-1 rounded-lg font-medium hover:bg-opacity-90 transition-all duration-200"
              >
                GO
              </button>
            </form>
          </div>

          <div className="order-first md:order-last -mt-14">
            {/* Video placeholder */}
            <div className="bg-[#393E46] rounded-xl aspect-video shadow-2xl flex items-center justify-center">
              <div className="text-white text-lg font-medium opacity-50">
                Demo Video Coming Soon
              </div>
            </div>
          </div>
        </div>

        {/* Footer: Copyright left, socials right */}
        <footer className="mt-24 flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-[#948979] border-opacity-20">
          {/* Copyright */}
          <p className="text-[#948979] text-sm">
            © 2025 Coil Code by AA³. All rights reserved
          </p>

          {/* Social icons */}
          <div className="flex items-center space-x-6">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#DFD0B8] hover:text-white transition-colors duration-200"
            >
              <Image
                src="/soical_icons/github-142-svgrepo-com.svg"
                alt="GitHub"
                width={24}
                height={24}
                className="w-6 h-6"
              />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#DFD0B8] hover:text-white transition-colors duration-200"
            >
              <Image
                src="/soical_icons/X_logo_2023_original.svg"
                alt="Twitter"
                width={24}
                height={24}
                className="w-6 h-6"
              />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#DFD0B8] hover:text-white transition-colors duration-200"
            >
              <Image
                src="/soical_icons/linkedin-svgrepo-com.svg"
                alt="LinkedIn"
                width={24}
                height={24}
                className="w-6 h-6"
              />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#DFD0B8] hover:text-white transition-colors duration-200"
            >
              <Image
                src="/soical_icons/instagram-167-svgrepo-com.svg"
                alt="Instagram"
                width={24}
                height={24}
                className="w-6 h-6"
              />
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
