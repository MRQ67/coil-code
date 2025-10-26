"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { useUsername } from "@/hooks/useUsername";
import UsernamePrompt from "@/components/UsernamePrompt";

export default function HomePage() {
  const router = useRouter();
  const { userInfo, saveUserInfo, generateRandom } = useUsername();
  const [showModal, setShowModal] = useState(false);

  const handleCreateRoom = () => {
    // Check if user info exists
    if (userInfo) {
      // User info exists, create room and navigate directly
      const roomId = nanoid(10);
      router.push(`/editor/${roomId}`);
    } else {
      // No user info, show the modal
      setShowModal(true);
    }
  };

  // Handle username save from modal
  const handleUsernameSave = (
    name: string,
    gender: "boy" | "girl" | "random",
  ) => {
    // Save user info
    saveUserInfo(name, gender);

    // Close modal
    setShowModal(false);

    // Create room and navigate
    const roomId = nanoid(10);
    router.push(`/editor/${roomId}`);
  };

  // Handle random generation
  const handleGenerateRandom = () => {
    // Generate random credentials
    generateRandom();

    // Close modal
    setShowModal(false);

    // Create room and navigate
    const roomId = nanoid(10);
    router.push(`/editor/${roomId}`);
  };

  return (
    <>
      {/* Username Prompt Modal - Only shows when button is clicked */}
      <UsernamePrompt
        isOpen={showModal}
        onSave={handleUsernameSave}
        onGenerateRandom={handleGenerateRandom}
      />

      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="w-full max-w-2xl px-6">
          {/* Main Content */}
          <div className="text-center">
            {/* Icon/Logo */}
            <div className="mb-8 flex justify-center">
              <div className="rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 p-6 shadow-2xl">
                <svg
                  className="h-16 w-16 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
            </div>

            {/* Heading */}
            <h1 className="mb-4 text-5xl font-bold text-white">
              Coil Code Editor
            </h1>

            <p className="mb-8 text-lg text-gray-400">
              Write code together in real-time with your team
            </p>

            {/* Features */}
            <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-gray-800/50 p-4 backdrop-blur-sm">
                <div className="mb-2 text-2xl">⚡</div>
                <h3 className="mb-1 font-semibold text-white">
                  Real-time Sync
                </h3>
                <p className="text-sm text-gray-400">
                  See changes instantly as you type
                </p>
              </div>
              <div className="rounded-lg bg-gray-800/50 p-4 backdrop-blur-sm">
                <div className="mb-2 text-2xl">🔒</div>
                <h3 className="mb-1 font-semibold text-white">Private Rooms</h3>
                <p className="text-sm text-gray-400">
                  Secure collaboration spaces
                </p>
              </div>
              <div className="rounded-lg bg-gray-800/50 p-4 backdrop-blur-sm">
                <div className="mb-2 text-2xl">🎨</div>
                <h3 className="mb-1 font-semibold text-white">Modern Editor</h3>
                <p className="text-sm text-gray-400">
                  Powered by Monaco Editor
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleCreateRoom}
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-blue-500/50"
            >
              <span className="relative flex items-center space-x-2">
                <span>Create New Room</span>
                <svg
                  className="h-5 w-5 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
            </button>

            <p className="mt-6 text-sm text-gray-500">
              No sign-up required • Free to use • Instant collaboration
            </p>
          </div>

          {/* Footer */}
          <div className="mt-16 text-center text-sm text-gray-600">
            <p>Built with Next.js, Yjs, PartyKit, and Monaco Editor</p>
          </div>
        </div>
      </div>
    </>
  );
}
