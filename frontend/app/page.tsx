"use client";

import { useUsername } from "@/hooks/useUsername";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid"; // eslint-disable-line @typescript-eslint/no-unused-vars
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoaderThree } from "@/components/ui/loader";

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
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  const { userInfo, isLoading: isUserLoading, clearUserInfo } = useUsername();

  const createNewRoom = async () => {
    if (isCreatingRoom) return; // Prevent multiple clicks

    setIsCreatingRoom(true);
    try {
      const roomId = nanoid(10);
      router.push(`/editor/${roomId}`);
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleJoinRoom = (code: string) => {
    router.push(`/editor/${code}`);
  };

  const handleSignOut = () => {
    clearUserInfo();
    setIsSignOutDialogOpen(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (isUserLoading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <LoaderThree />
          </div>
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main
      className={`min-h-screen relative overflow-hidden font-sans selection:bg-primary/30 ${userInfo ? "bg-black text-white" : "bg-background"}`}
    >
      {/* BACKGROUNDS */}
      {userInfo ? (
        // Returning User Background
        <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-[#111111] z-0 rounded-l-[2.5rem] hidden md:block"></div>
      ) : (
        // New User Background (Original)
        <>
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full opacity-10 blur-3xl -translate-y-1/2 translate-x-1/2 -z-10" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary rounded-full opacity-10 blur-3xl translate-y-1/2 -translate-x-1/2 -z-10" />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-card z-0 rounded-l-3xl hidden md:block"></div>
        </>
      )}

      <div className="relative z-10 container mx-auto px-6 md:px-12 py-8 min-h-screen flex flex-col">
        {/* HEADER */}
        <header className="flex justify-between items-center mb-8 md:mb-16 h-20 shrink-0">
          {/* Logo */}
          <div className="flex items-center">
            <Image
              src="/logo.svg"
              alt="Coil Code Logo"
              width={userInfo ? 120 : 180}
              height={userInfo ? 60 : 180}
              className={userInfo ? "h-14 w-auto object-contain" : "w-25 h-25"}
              priority
            />
          </div>

          {/* GitHub Link */}
          {userInfo ? (
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs text-muted-foreground mb-1 mr-1">
                check it out in
              </span>
              <a
                href="https://github.com/MRQ67/coil-code"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-black px-4 py-2 rounded-full font-medium flex items-center gap-2 hover:bg-gray-200 transition-colors"
              >
                <Image
                  src="/soical_icons/github-142-svgrepo-com.svg"
                  alt="GitHub"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
                GitHub
              </a>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-muted-foreground text-sm mb-2">
                check it out in
              </p>
              <a
                href="https://github.com/MRQ67/coil-code"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-all duration-200"
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
          )}
        </header>

        {/* MAIN CONTENT */}
        <div className="flex-1 grid md:grid-cols-2 gap-8 md:gap-16 items-center">
          {/* Left Column */}
          <motion.div
            key={userInfo ? "returning-user-left" : "new-user-left"}
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col justify-center space-y-6"
          >
            {userInfo ? (
              // --- RETURNING USER LEFT CONTENT ---
              <>
                <div className="space-y-2">
                  <motion.div
                    variants={itemVariants}
                    className="flex items-center gap-3 text-2xl md:text-3xl font-light text-gray-300"
                  >
                    <span>Welcome Back to</span>
                    <Image
                      src="/inline_logo.svg"
                      alt="coil"
                      width={60}
                      height={20}
                      className="opacity-80"
                    />
                  </motion.div>
                  <motion.h1
                    variants={itemVariants}
                    className={`${userInfo.username.length > 10 ? "text-3xl md:text-4xl lg:text-5xl" : "text-5xl md:text-6xl lg:text-7xl"} font-bold text-white tracking-tight`}
                  >
                    {userInfo.username}
                  </motion.h1>
                </div>

                <motion.p
                  variants={itemVariants}
                  className="text-xl text-gray-400 font-light"
                >
                  What do you want do today?
                </motion.p>

                <motion.div
                  variants={itemVariants}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4"
                >
                  <button
                    onClick={createNewRoom}
                    disabled={isCreatingRoom}
                    className="group bg-[#E6E6E6] text-black px-6 py-3.5 rounded-xl text-lg font-semibold hover:bg-white transition-all duration-200 flex items-center gap-2 w-full sm:w-auto justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingRoom ? (
                      <>
                        <span>Creating...</span>
                        <div className="w-5 h-5 flex justify-center items-center">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      </>
                    ) : (
                      <>
                        <span>Create New Room</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <span className="text-gray-500 font-medium hidden sm:block">
                      or
                    </span>
                    <button
                      onClick={() => setIsDialogOpen(true)}
                      className="group bg-[#222222] text-white px-6 py-3.5 rounded-xl text-lg font-semibold hover:bg-[#333333] transition-all duration-200 flex items-center gap-2 w-full sm:w-auto justify-between border border-gray-800"
                    >
                      <span>Join Room</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              </>
            ) : (
              // --- NEW USER LEFT CONTENT (ORIGINAL) ---
              <>
                <motion.h1
                  key="hero-title"
                  variants={itemVariants}
                  className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight"
                >
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
                        My personal portfolio website that showcases my
                        projects, skills, and experience in software development
                        and AI applications.
                      </GlimpseDescription>
                    </GlimpseContent>
                  </Glimpse>
                </motion.h1>

                <motion.div
                  variants={itemVariants}
                  className="text-lg md:text-xl text-white space-y-2"
                >
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
                        <GlimpseTitle>
                          Next.js - The React Framework
                        </GlimpseTitle>
                        <GlimpseDescription>
                          Next.js is a React framework that gives you building
                          blocks to create web applications with server-side
                          rendering, static site generation, and more.
                        </GlimpseDescription>
                      </GlimpseContent>
                    </Glimpse>
                    <span className="text-muted-foreground text-sm">
                      (frontend)
                    </span>
                    ,{" "}
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
                    <span className="text-muted-foreground text-sm">
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
                        <GlimpseTitle>
                          PartyKit - Real-time Backend
                        </GlimpseTitle>
                        <GlimpseDescription>
                          PartyKit is a platform for building real-time
                          collaborative applications with WebSockets, providing
                          scalable multiplayer infrastructure.
                        </GlimpseDescription>
                      </GlimpseContent>
                    </Glimpse>
                    <span className="text-muted-foreground text-sm">
                      (backend)
                    </span>
                    , and it is -{" "}
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
                  </p>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="flex items-center justify-start space-x-4 mt-6"
                >
                  <button
                    onClick={createNewRoom}
                    disabled={isCreatingRoom}
                    className="bg-primary text-primary-foreground px-8 py-2 rounded-xl text-lg font-semibold hover:transform hover:scale-105 hover:shadow-lg transition-all duration-200 flex items-center space-x-2 w-fit disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingRoom ? (
                      <>
                        <span>Creating...</span>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      </>
                    ) : (
                      <>
                        <span>Create New Room</span>
                        <span>→</span>
                      </>
                    )}
                  </button>

                  <span className="text-muted-foreground text-sm font-medium">
                    or
                  </span>

                  <button
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-muted text-white px-8 py-2 rounded-xl text-lg font-semibold hover:transform hover:scale-105 hover:shadow-lg transition-all duration-200 flex items-center space-x-2 w-fit"
                  >
                    <span>Join Room</span>
                    <span>→</span>
                  </button>
                </motion.div>
              </>
            )}
          </motion.div>

          {/* Right Column */}
          <motion.div
            key={userInfo ? "returning-user-right" : "new-user-right"}
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col items-center justify-center relative h-full w-full"
          >
            {" "}
            {userInfo ? (
              // --- RETURNING USER RIGHT CONTENT ---
              <motion.div
                variants={itemVariants}
                className="flex flex-col items-center gap-8 -mt-12"
              >
                <div className="relative w-56 h-56 md:w-64 md:h-64 rounded-full bg-[#E0D4FC] flex items-center justify-center overflow-hidden shadow-2xl border-[12px] border-[#E0D4FC]/20">
                  <Image
                    src={`https://avatar.iran.liara.run/public/${userInfo.gender === "random" ? (userInfo.username.charCodeAt(0) % 2 === 0 ? "boy" : "girl") : userInfo.gender}?username=${encodeURIComponent(userInfo.username)}`}
                    alt={`${userInfo.username}'s avatar`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover scale-90 mt-4"
                    priority
                  />
                </div>

                <button
                  onClick={() => setIsSignOutDialogOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-[#1A1A1A] border border-white/10 text-white rounded-full font-medium hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 transition-all duration-300"
                >
                  Sign out
                  <LogOut className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              // --- NEW USER RIGHT CONTENT (ORIGINAL VIDEO) ---
              <motion.div
                variants={itemVariants}
                className="relative rounded-xl shadow-2xl overflow-hidden border-4 border-card aspect-video w-full md:w-11/12 -mt-12"
              >
                <video
                  src="/video/Coil_code_demo.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="shrink-0 h-20 flex flex-col md:flex-row justify-between items-center pb-8 mt-auto">
          <p
            className={`${userInfo ? "text-gray-500" : "text-foreground"} text-sm`}
          >
            © 2025 Coil Code by AA³. All rights reserved
          </p>

          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <a
              href="https://github.com/MRQ67"
              className="opacity-60 hover:opacity-100 transition-opacity"
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
              href="https://x.com/HimoNotting"
              className="opacity-60 hover:opacity-100 transition-opacity"
            >
              <Image
                src="/soical_icons/X_logo_2023_original.svg"
                alt="X"
                width={24}
                height={24}
                className="w-6 h-6 invert"
              />
            </a>
            <a
              href="https://www.linkedin.com/in/abdellah-qadi-b229382a2/"
              className="opacity-60 hover:opacity-100 transition-opacity"
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
              href="https://www.instagram.com/simply_aboo/"
              className="opacity-60 hover:opacity-100 transition-opacity"
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

      {/* Sign Out Confirmation Dialog */}
      <Dialog open={isSignOutDialogOpen} onOpenChange={setIsSignOutDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#1A1A1A] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Sign out</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to sign out? Your username and avatar
              preferences will be cleared from this device.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsSignOutDialogOpen(false)}
              className="text-white hover:bg-white/10 hover:text-white"
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleSignOut}>
              Sign out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
