"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import CollaborativeEditor from "@/components/editor/CollaborativeEditor";
import ErrorBoundary from "@/components/ErrorBoundary";
import {
  createCollaborativeDoc,
  destroyCollaborativeDoc,
  type CollaborativeDoc,
} from "@/lib/yjs-setup";
import { useUsername } from "@/hooks/useUsername";
import UsernamePrompt from "@/components/UsernamePrompt";
import UserAvatar from "@/components/UserAvatar";

export default function EditorPage() {
  const params = useParams();
  const roomId = params?.roomId as string | undefined;

  const [collaborativeDoc, setCollaborativeDoc] =
    useState<CollaborativeDoc | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const isInitializing = useRef(false);

  // Get user info and username prompt state
  const {
    userInfo,
    showPrompt,
    isLoading: isLoadingUser,
    saveUserInfo,
    generateRandom,
    openPrompt,
  } = useUsername();

  // Helper function to generate random color for cursor
  const getRandomColor = () => {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#FFA07A",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
      "#85C1E2",
      "#F8B739",
      "#52B788",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  useEffect(() => {
    // Prevent double initialization in strict mode
    if (isInitializing.current) {
      return;
    }

    // Validate roomId
    if (!roomId) {
      return;
    }

    // Don't initialize editor until user info is loaded and available
    if (isLoadingUser || !userInfo) {
      return;
    }

    isInitializing.current = true;

    // Initialize collaborative document with user awareness
    let doc: CollaborativeDoc | null = null;
    try {
      doc = createCollaborativeDoc(roomId);

      // Set user info in Yjs awareness
      if (doc.provider.awareness) {
        doc.provider.awareness.setLocalStateField("user", {
          name: userInfo.username,
          gender: userInfo.gender,
          color: getRandomColor(),
        });
      }

      // Defer setState to avoid cascading renders warning
      Promise.resolve().then(() => {
        setCollaborativeDoc(doc);
        setIsConnected(true);
      });
    } catch (err) {
      console.error("Failed to create collaborative document:", err);
      isInitializing.current = false;
    }

    // Cleanup on unmount
    return () => {
      if (doc) {
        destroyCollaborativeDoc(doc);
      }
      isInitializing.current = false;
    };
  }, [roomId, userInfo, isLoadingUser]);

  // Handle username save from modal
  const handleUsernameSave = (
    name: string,
    gender: "boy" | "girl" | "random",
  ) => {
    saveUserInfo(name, gender);
  };

  // Handle random generation
  const handleGenerateRandom = () => {
    generateRandom();
  };

  // Invalid room ID
  if (!roomId) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900">
        <div className="max-w-md rounded-lg border border-red-500/50 bg-red-900/20 p-6 text-center">
          <h2 className="mb-2 text-xl font-semibold text-red-400">
            Invalid Room
          </h2>
          <p className="text-gray-300">The room ID is invalid or missing.</p>
          <a
            href="/"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  // Show username prompt if needed
  if (showPrompt || !userInfo) {
    return (
      <>
        <UsernamePrompt
          isOpen={true}
          onSave={handleUsernameSave}
          onGenerateRandom={handleGenerateRandom}
        />
        <div className="flex h-screen w-full items-center justify-center bg-gray-900">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            <p className="text-lg text-gray-300">Setting up your profile...</p>
          </div>
        </div>
      </>
    );
  }

  // Loading state
  if (!isConnected || !collaborativeDoc) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="text-lg text-gray-300">Connecting to room...</p>
          <p className="mt-2 text-sm text-gray-500">Room ID: {roomId}</p>
        </div>
      </div>
    );
  }

  // Editor state
  return (
    <ErrorBoundary>
      <div className="flex h-screen w-full flex-col bg-gray-900">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-6 py-3">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-white">
              Collaborative Code Editor
            </h1>
            <span className="rounded-full bg-green-500/20 px-3 py-1 text-sm text-green-400">
              Connected
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {/* User Avatar and Name */}
            <div className="flex items-center space-x-2 rounded-lg bg-gray-700/50 px-3 py-2">
              <UserAvatar
                username={userInfo.username}
                gender={userInfo.gender}
                size={32}
                showTooltip
              />
              <span className="text-sm text-gray-300">{userInfo.username}</span>
            </div>

            {/* Edit Profile Button */}
            <button
              onClick={openPrompt}
              className="rounded-lg bg-gray-700 px-3 py-2 text-sm text-white transition-colors hover:bg-gray-600"
              title="Change your profile"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>

            {/* Room ID */}
            <div className="text-sm text-gray-400">
              Room: <span className="font-mono text-gray-300">{roomId}</span>
            </div>

            {/* Leave Room Button */}
            <a
              href="/"
              className="rounded-lg bg-gray-700 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-600"
            >
              Leave Room
            </a>
          </div>
        </header>

        {/* Username Prompt Modal (for editing) */}
        {showPrompt && (
          <UsernamePrompt
            isOpen={showPrompt}
            onSave={handleUsernameSave}
            onGenerateRandom={handleGenerateRandom}
            defaultName={userInfo.username}
            defaultGender={userInfo.gender}
          />
        )}

        {/* Editor */}
        <main className="flex-1 overflow-hidden">
          <CollaborativeEditor
            ydoc={collaborativeDoc.ydoc}
            ytext={collaborativeDoc.ytext}
            provider={collaborativeDoc.provider}
          />
        </main>
      </div>
    </ErrorBoundary>
  );
}
