"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import Image from "next/image";
import RoomCodeDialog from "@/components/RoomCodeDialog";
import {
  Glimpse,
  GlimpseTrigger,
  GlimpseContent,
  GlimpseTitle,
  GlimpseDescription,
  GlimpseImage,
} from "@/components/kibo-ui/glimpse";

export default function HomePage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const createNewRoom = () => {
    router.push(`/editor/${nanoid(10)}`);
  };

  const joinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim()) router.push(`/editor/${roomCode.trim()}`);
  };

  const handleJoinRoom = (code: string) => {
    router.push(`/editor/${code}`);
  };

  return (
    <main className="min-h-screen bg-[#222831] relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#DFD0B8] rounded-full opacity-10 blur-3xl -translate-y-1/2 translate-x-1/2 -z-10" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#DFD0B8] rounded-full opacity-10 blur-3xl translate-y-1/2 -translate-x-1/2 -z-10" />

      {/* Background for right side with #393E46 extending until footer */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[#393E46] z-0 rounded-l-3xl"></div>

      <div className="relative z-10 container mx-auto px-6 md:px-12 py-8">
        {/* Header: Logo left, GitHub right */}
        <header className="flex justify-between items-center mb-16">
          {/* Logo only - no text */}
          <div className="flex items-center">
            <Image
              src="/logo.svg"
              alt="Coil Code Logo"
              width={180}
              height={180}
              className="w-25 h-25"
            />
          </div>

          {/* GitHub button */}
          <div className="text-center">
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
                <Glimpse>
                  <GlimpseTrigger asChild>
                    <a
                      href="https://aa3.site"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block"
                    >
                      <Image
                        src="/aa3_logo.svg"
                        alt="AA3 Logo"
                        width={50}
                        height={38}
                        className="inline w-11 h-10 md:w-12 md:h-11 align-middle hover:opacity-80 transition-opacity"
                      />
                    </a>
                  </GlimpseTrigger>
                  <GlimpseContent>
                    <GlimpseImage
                      src="/screenshots/aa3.png"
                      alt="AA3 Website Screenshot"
                    />
                    <GlimpseTitle>AA3 - My Portfolio Website</GlimpseTitle>
                    <GlimpseDescription>
                      My personal portfolio website that showcases my projects,
                      skills, and experience in software development and AI
                      applications.
                    </GlimpseDescription>
                  </GlimpseContent>
                </Glimpse>
              </h1>

              <div className="text-lg md:text-xl text-white space-y-2">
                <p className="flex items-center flex-wrap gap-2">
                  Built using{" "}
                  <Glimpse>
                    <GlimpseTrigger asChild>
                      <a
                        href="https://nextjs.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:opacity-80 transition-opacity underline decoration-white/60 hover:decoration-white"
                      >
                        <span>Next.js</span>
                        <Image
                          src="/nextjs-icon.svg"
                          alt="Next.js"
                          width={28}
                          height={28}
                          className="w-7 h-7 align-middle"
                        />
                      </a>
                    </GlimpseTrigger>
                    <GlimpseContent>
                      <GlimpseImage
                        src="/screenshots/nextjs.png"
                        alt="Next.js Website Screenshot"
                      />
                      <GlimpseTitle>Next.js - The React Framework</GlimpseTitle>
                      <GlimpseDescription>
                        Next.js is a React framework that gives you building
                        blocks to create web applications with server-side
                        rendering, static site generation, and more.
                      </GlimpseDescription>
                    </GlimpseContent>
                  </Glimpse>
                  <span className="text-[#948979] text-sm">(frontend)</span>,{" "}
                  <Glimpse>
                    <GlimpseTrigger asChild>
                      <a
                        href="https://yjs.dev"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:opacity-80 transition-opacity underline decoration-white/60 hover:decoration-white"
                      >
                        <span>Yjs</span>
                        <Image
                          src="/yjs-icon.svg"
                          alt="Yjs"
                          width={28}
                          height={28}
                          className="w-7 h-7 align-middle"
                        />
                      </a>
                    </GlimpseTrigger>
                    <GlimpseContent>
                      <GlimpseImage
                        src="/screenshots/yjs.png"
                        alt="Yjs Website Screenshot"
                      />
                      <GlimpseTitle>Yjs - Shared Data Types</GlimpseTitle>
                      <GlimpseDescription>
                        Yjs is a CRDT implementation that exposes its internal
                        data structure as shared types for building
                        collaborative applications.
                      </GlimpseDescription>
                    </GlimpseContent>
                  </Glimpse>
                  <span className="text-[#948979] text-sm">
                    (synchronization)
                  </span>
                  ,{" "}
                  <Glimpse>
                    <GlimpseTrigger asChild>
                      <a
                        href="https://partykit.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:opacity-80 transition-opacity underline decoration-white/60 hover:decoration-white"
                      >
                        <span>PartyKit</span>
                        <Image
                          src="/partykit-icon.svg"
                          alt="PartyKit"
                          width={28}
                          height={28}
                          className="w-7 h-7 align-middle"
                        />
                      </a>
                    </GlimpseTrigger>
                    <GlimpseContent>
                      <GlimpseImage
                        src="/screenshots/partykit.png"
                        alt="PartyKit Website Screenshot"
                      />
                      <GlimpseTitle>PartyKit - Real-time Backend</GlimpseTitle>
                      <GlimpseDescription>
                        PartyKit is a platform for building real-time
                        collaborative applications with WebSockets, providing
                        scalable multiplayer infrastructure.
                      </GlimpseDescription>
                    </GlimpseContent>
                  </Glimpse>
                  <span className="text-[#948979] text-sm">(backend)</span>, and
                  it is -{" "}
                  <Glimpse>
                    <GlimpseTrigger asChild>
                      <a
                        href="https://microsoft.github.io/monaco-editor/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:opacity-80 transition-opacity underline decoration-white/60 hover:decoration-white"
                      >
                        <strong>Powered by Monaco Editor</strong>
                      </a>
                    </GlimpseTrigger>
                    <GlimpseContent>
                      <GlimpseImage
                        src="/screenshots/monaco.png"
                        alt="Monaco Editor Website Screenshot"
                      />
                      <GlimpseTitle>
                        Monaco Editor - VS Code Editor
                      </GlimpseTitle>
                      <GlimpseDescription>
                        Monaco Editor is the code editor that powers VS Code,
                        offering rich IntelliSense, validation, and advanced
                        editing features for the web.
                      </GlimpseDescription>
                    </GlimpseContent>
                  </Glimpse>
                  .
                </p>
              </div>
            </div>

            {/* Action buttons - side by side */}
            <div className="flex items-center justify-start space-x-4 mt-6">
              {/* Create Room button */}
              <button
                onClick={createNewRoom}
                className="bg-[#DFD0B8] text-[#222831] px-8 py-2 rounded-xl text-lg font-semibold hover:transform hover:scale-105 hover:shadow-lg transition-all duration-200 flex items-center space-x-2 w-fit"
              >
                <span>Create New Room</span>
                <span>→</span>
              </button>

              {/* "or" text */}
              <span className="text-[#948979] text-sm font-medium">or</span>

              {/* Join room button */}
              <button
                onClick={() => setIsDialogOpen(true)}
                className="bg-[#948979] text-white px-8 py-2 rounded-xl text-lg font-semibold hover:bg-opacity-90 transition-all duration-200 flex items-center space-x-2 w-fit"
              >
                <span>Join Room</span>
                <span>→</span>
              </button>
            </div>
          </div>

          <div className="order-first md:order-last -mt-8 translate-x-26">
            {/* Video placeholder */}
            <div className="bg-[#948979] rounded-xl aspect-4/3 shadow-2xl flex items-center justify-center w-4/5">
              <div className="text-white text-lg font-medium opacity-50">
                Demo Video Coming Soon
              </div>
            </div>
          </div>
        </div>

        {/* Footer: Copyright left, socials right */}
        <footer className="mt-16 flex flex-col md:flex-row justify-between items-center gap-4 pt-8">
          {/* Copyright */}
          <p className="text-white text-sm">
            © 2025 Coil Code by AA³. All rights reserved
          </p>

          {/* Social icons */}
          <div className="flex items-center space-x-6">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-[#DFD0B8] transition-colors duration-200"
            >
              <Image
                src="/soical_icons/github-142-svgrepo-com.svg"
                alt="GitHub"
                width={24}
                height={24}
                className="w-6 h-6 invert"
              />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-[#DFD0B8] transition-colors duration-200"
            >
              <Image
                src="/soical_icons/X_logo_2023_original.svg"
                alt="Twitter"
                width={24}
                height={24}
                className="w-6 h-6 invert"
              />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-[#DFD0B8] transition-colors duration-200"
            >
              <Image
                src="/soical_icons/linkedin-svgrepo-com.svg"
                alt="LinkedIn"
                width={24}
                height={24}
                className="w-6 h-6 invert"
              />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-[#DFD0B8] transition-colors duration-200"
            >
              <Image
                src="/soical_icons/instagram-167-svgrepo-com.svg"
                alt="Instagram"
                width={24}
                height={24}
                className="w-6 h-6 invert"
              />
            </a>
          </div>
        </footer>
      </div>

      {/* Room Code Dialog */}
      <RoomCodeDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onJoinRoom={handleJoinRoom}
      />
    </main>
  );
}
