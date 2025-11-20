"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
// Dynamically import EditorLayout to avoid SSR issues with Monaco
const EditorLayout = dynamic(() => import("@/components/editor/EditorLayout"), { ssr: false });
import ErrorBoundary from "@/components/ErrorBoundary";
import {
  createCollaborativeDoc,
  destroyCollaborativeDoc,
  setUserAwareness,
  type CollaborativeDoc,
} from "@/lib/yjs-setup";
import { useUsername } from "@/hooks/useUsername";
import { usePresence } from "@/hooks/usePresence";
import { useAutoSave } from "@/hooks/useAutoSave";
import UsernamePrompt from "@/components/UsernamePrompt";
import UserListTooltip from "@/components/editor/UserListTooltip";
import SaveStatusIndicator from "@/components/editor/SaveStatusIndicator";
import KeyboardShortcutsModal from "@/components/KeyboardShortcutsModal";
import CopyRoomLinkButton from "@/components/CopyRoomLinkButton";
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function EditorPage() {
  const params = useParams();
  const roomId = params?.roomId as string | undefined;

  const [collaborativeDoc, setCollaborativeDoc] =
    useState<CollaborativeDoc | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const isInitializing = useRef(false);
  const initialContentLoadedRef = useRef(false);

  // Get room data from Convex
  const roomData = useQuery(api.rooms.getRoom, { roomId: roomId || '' });

  // Get user info
  const {
    userInfo,
    isLoading: isLoadingUser,
    saveUserInfo,
    generateRandom,
  } = useUsername();

  // Local state for modal (for edit profile button)
  const [showEditModal, setShowEditModal] = useState(false);

  // Derive modal state - show if no user info and not loading
  const showModalForNewUser = !isLoadingUser && !userInfo;

  // Track all connected users in real-time
  const { users, userCount } = usePresence(collaborativeDoc?.provider || null);

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

      // Set user info in Yjs awareness with proper field names
      setUserAwareness(doc.provider, {
        username: userInfo.username,
        gender: userInfo.gender,
      });

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

  // Load room content from Convex only once after initial connection AND after PartyKit sync
  useEffect(() => {
    if (!collaborativeDoc || !roomId || !isConnected || initialContentLoadedRef.current) return;
    if (roomData === undefined) return;

    // CRITICAL: Wait for PartyKit to finish its initial sync before loading from Convex
    // This prevents duplication where we load from Convex, then PartyKit syncs additional content
    const loadContentAfterSync = () => {
      if (!collaborativeDoc || initialContentLoadedRef.current) return;

      collaborativeDoc.ydoc.transact(() => {
        const yhtmlText = collaborativeDoc.ydoc.getText('html');
        const ycssText = collaborativeDoc.ydoc.getText('css');
        const yjsText = collaborativeDoc.ydoc.getText('js');

        // Only load from Convex if Yjs document is STILL empty after PartyKit sync
        const isDocumentEmpty = yhtmlText.length === 0 && ycssText.length === 0 && yjsText.length === 0;

        if (isDocumentEmpty && roomData) {
          // Document is empty even after sync, load from Convex
          yhtmlText.insert(0, roomData.htmlContent || '<!-- Start coding HTML here -->');
          ycssText.insert(0, roomData.cssContent || '/* Start coding CSS here */');
          yjsText.insert(0, roomData.jsContent || '// Start coding JavaScript here');
          console.log('📥 Loaded initial content from Convex (document was empty after sync)');
        } else if (!isDocumentEmpty) {
          console.log('✅ Document has content from PartyKit sync, skipping Convex load');
        }
      });

      initialContentLoadedRef.current = true;
      setInitialDataLoaded(true);
      setIsLoading(false);
    };

    // Wait for provider to sync before loading content
    // The 'synced' event fires after initial sync is complete
    if (collaborativeDoc.provider.synced) {
      // Already synced, load immediately
      console.log('🔄 PartyKit already synced, loading content now');
      loadContentAfterSync();
    } else {
      // Wait for sync to complete
      console.log('⏳ Waiting for PartyKit to sync before loading content...');
      const handleSync = (isSynced: boolean) => {
        if (isSynced) {
          console.log('✅ PartyKit sync complete, now checking for content');
          loadContentAfterSync();
          collaborativeDoc.provider.off('synced', handleSync);
        }
      };
      collaborativeDoc.provider.on('synced', handleSync);

      // Cleanup listener
      return () => {
        collaborativeDoc.provider.off('synced', handleSync);
      };
    }
  }, [collaborativeDoc, roomId, isConnected, roomData]);

  // Auto-save - save to Convex periodically and when leaving
  const { save: manualSave, saveStatus } = useAutoSave({
    roomId: roomId || '',
    htmlContent: () => collaborativeDoc?.ydoc.getText('html').toString() || '',
    cssContent: () => collaborativeDoc?.ydoc.getText('css').toString() || '',
    jsContent: () => collaborativeDoc?.ydoc.getText('js').toString() || '',
    username: userInfo?.username || '',
  });

  // Handle username save from modal
  const handleUsernameSave = (
    name: string,
    gender: "boy" | "girl" | "random",
  ) => {
    saveUserInfo(name, gender);
    setShowEditModal(false);
  };

  // Handle random generation
  const handleGenerateRandom = () => {
    generateRandom();
    setShowEditModal(false);
  };

  // Manual save with Cmd+S / Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+S (Mac) or Ctrl+S (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault(); // Prevent browser's default save dialog
        manualSave();
        console.log('🔄 Manual save triggered');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [manualSave]);

  // Invalid room ID
  if (!roomId) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900">
        <div className="max-w-md rounded-lg border border-red-500/50 bg-red-900/20 p-6 text-center">
          <h2 className="mb-2 text-xl font-semibold text-red-400">
            Invalid Room
          </h2>
          <p className="text-gray-300">The room ID is invalid or missing.</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Show loading while checking user info
  if (isLoadingUser) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="text-lg text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Show modal if no user info
  if (!userInfo) {
    return (
      <>
        <UsernamePrompt
          isOpen={showModalForNewUser}
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

  // Loading state - waiting for Convex data with skeleton
  if (!isConnected || !collaborativeDoc || isLoading || (!initialDataLoaded && roomData === undefined)) {
    return (
      <div className="flex h-screen w-full flex-col bg-[#1E1E1E]">
        {/* Header skeleton */}
        <header className="flex items-center justify-between border-b border-[#3C3C3C] bg-[#2D2D30] px-6 py-3">
          <div className="flex items-center space-x-4 animate-pulse">
            <div className="h-6 w-32 bg-gray-700 rounded"></div>
            <div className="h-6 w-20 bg-gray-700 rounded-full"></div>
            <div className="h-4 w-40 bg-gray-700 rounded"></div>
          </div>
          <div className="flex items-center space-x-4 animate-pulse">
            <div className="h-10 w-10 bg-gray-700 rounded-full"></div>
            <div className="h-10 w-10 bg-gray-700 rounded-full"></div>
            <div className="h-10 w-24 bg-gray-700 rounded-lg"></div>
          </div>
        </header>

        {/* Content skeleton */}
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            <p className="text-lg text-gray-300">Loading room content...</p>
            <p className="mt-2 text-sm text-gray-500">Room ID: {roomId}</p>
          </div>
        </main>
      </div>
    );
  }

  // Editor state
  return (
    <ErrorBoundary>
      <div className="flex h-screen w-full flex-col bg-[#1E1E1E]">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-[#3C3C3C] bg-[#2D2D30] px-6 py-3">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-white">
              Coil Code Editor
            </h1>
            <span className="rounded-full bg-green-500/20 px-3 py-1 text-sm text-green-400">
              Connected
            </span>
            <SaveStatusIndicator status={saveStatus} />
            <div className="text-sm text-gray-400">
              Room: <span className="font-mono text-gray-300">{roomId}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Real-time User List with Stacked Avatars */}
            <UserListTooltip users={users} maxVisible={5} />

            {/* User Count Badge */}
            <div className="rounded-lg bg-[#252526] px-3 py-2">
              <span className="text-sm text-gray-400">
                {userCount} {userCount === 1 ? "user" : "users"} online
              </span>
            </div>

            {/* Copy Room Link Button */}
            <CopyRoomLinkButton roomId={roomId} />

            {/* Keyboard Shortcuts Modal */}
            <KeyboardShortcutsModal />

            {/* Edit Profile Button */}
            <button
              onClick={() => setShowEditModal(true)}
              className="rounded-lg bg-[#252526] px-3 py-2 text-sm text-white transition-colors hover:bg-gray-600"
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

            {/* Leave Room Button */}
            <Link
              href="/"
              className="rounded-lg bg-[#252526] px-4 py-2 text-sm text-white transition-colors hover:bg-gray-600"
            >
              Leave Room
            </Link>
          </div>
        </header>

        {/* Username Prompt Modal (for editing) */}
        <UsernamePrompt
          isOpen={showEditModal}
          onSave={handleUsernameSave}
          onGenerateRandom={handleGenerateRandom}
          defaultName={userInfo.username}
          defaultGender={userInfo.gender}
        />

        {/* Multi-file Editor Layout */}
        <main className="flex-1 overflow-hidden">
          <EditorLayout
            ydoc={collaborativeDoc.ydoc}
            provider={collaborativeDoc.provider}
            username={userInfo.username}
            gender={userInfo.gender}
            initialHtmlContent={roomData?.htmlContent || '<!-- Start coding HTML here -->'}
            initialCssContent={roomData?.cssContent || '/* Start coding CSS here */'}
            initialJsContent={roomData?.jsContent || '// Start coding JavaScript here'}
          />
        </main>
      </div>
    </ErrorBoundary>
  );
}