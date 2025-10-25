/**
 * UsernamePrompt Component
 * Enhanced modal for capturing username and gender with live avatar preview
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  generateRandomName,
  validateUsername,
  type Gender,
} from "@/lib/name-generator";
import UserAvatar from "./UserAvatar";

interface UsernamePromptProps {
  isOpen: boolean;
  onSave: (name: string, gender: Gender) => void;
  onGenerateRandom: () => void;
  defaultName?: string;
  defaultGender?: Gender;
}

export default function UsernamePrompt({
  isOpen,
  onSave,
  onGenerateRandom,
  defaultName = "",
  defaultGender = "random",
}: UsernamePromptProps) {
  const [name, setName] = useState(defaultName);
  const [debouncedName, setDebouncedName] = useState(defaultName);
  const [gender, setGender] = useState<Gender>(defaultGender);
  const [error, setError] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Debounce name input for avatar preview (300ms delay)
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedName(name);
    }, 300);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [name]);

  // Handle name input change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);

    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  // Handle gender selection
  const handleGenderChange = (newGender: Gender) => {
    setGender(newGender);
    // Immediately update debounced name when gender changes for instant preview
    setDebouncedName(name);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate username
    const validation = validateUsername(name);
    if (!validation.isValid) {
      setError(validation.error || "Invalid username");
      return;
    }

    // Save and close
    onSave(name, gender);
  };

  // Handle random name generation
  const handleRandomName = () => {
    const randomName = generateRandomName();
    setName(randomName);
    setError("");

    // Also randomize gender for fun
    const randomGenders: Gender[] = ["boy", "girl", "random"];
    const randomGender =
      randomGenders[Math.floor(Math.random() * randomGenders.length)];
    setGender(randomGender);
  };

  // Handle skip (generate everything randomly)
  const handleSkip = () => {
    onGenerateRandom();
  };

  // Prevent closing if no name is set (this is a required field)
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking the backdrop, not the modal content
    if (e.target === e.currentTarget) {
      // Don't close - username is required
    }
  };

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`relative w-full max-w-md transform rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 p-8 shadow-2xl transition-all duration-300 ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        } mx-4`}
        style={{
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-3">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Welcome!</h2>
          <p className="mt-2 text-sm text-gray-400">
            Choose your identity for collaboration
          </p>
        </div>

        {/* Live Avatar Preview */}
        <div className="mb-6 flex justify-center">
          <div className="relative rounded-xl bg-gray-700/50 p-4">
            {debouncedName ? (
              <UserAvatar username={debouncedName} gender={gender} size={80} />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-600">
                <svg
                  className="h-10 w-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            )}
            {/* Loading indicator when typing */}
            {name !== debouncedName && name.length >= 2 && (
              <div className="absolute bottom-2 right-2 rounded-full bg-blue-500 p-1">
                <svg
                  className="h-4 w-4 animate-spin text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Input */}
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Your Name
            </label>
            <input
              ref={inputRef}
              id="username"
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Enter your name..."
              className={`w-full rounded-lg border ${
                error ? "border-red-500" : "border-gray-600"
              } bg-gray-700 px-4 py-3 text-white placeholder-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
              maxLength={20}
            />
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
            <p className="mt-1 text-xs text-gray-500">
              {name.length}/20 characters
            </p>
          </div>

          {/* Gender Selection */}
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-300">
              Avatar Style
            </label>
            <div className="grid grid-cols-3 gap-3">
              {/* Boy Option */}
              <button
                type="button"
                onClick={() => handleGenderChange("boy")}
                className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 transition-all ${
                  gender === "boy"
                    ? "border-blue-500 bg-blue-500/20"
                    : "border-gray-600 bg-gray-700/50 hover:border-gray-500"
                }`}
              >
                <span className="mb-2 text-2xl">👦</span>
                <span className="text-xs font-medium text-white">Boy</span>
              </button>

              {/* Girl Option */}
              <button
                type="button"
                onClick={() => handleGenderChange("girl")}
                className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 transition-all ${
                  gender === "girl"
                    ? "border-pink-500 bg-pink-500/20"
                    : "border-gray-600 bg-gray-700/50 hover:border-gray-500"
                }`}
              >
                <span className="mb-2 text-2xl">👧</span>
                <span className="text-xs font-medium text-white">Girl</span>
              </button>

              {/* Random Option */}
              <button
                type="button"
                onClick={() => handleGenderChange("random")}
                className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 transition-all ${
                  gender === "random"
                    ? "border-purple-500 bg-purple-500/20"
                    : "border-gray-600 bg-gray-700/50 hover:border-gray-500"
                }`}
              >
                <span className="mb-2 text-2xl">🎲</span>
                <span className="text-xs font-medium text-white">Random</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            {/* Continue Button */}
            <button
              type="submit"
              className="group relative flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-blue-500/50"
            >
              <span className="flex items-center space-x-2">
                <span>Continue</span>
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

            {/* Random Name Button */}
            <button
              type="button"
              onClick={handleRandomName}
              className="flex items-center justify-center space-x-2 rounded-lg border border-gray-600 bg-gray-700/50 px-6 py-3 font-medium text-gray-300 transition-all hover:border-gray-500 hover:bg-gray-700"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                />
              </svg>
              <span>✨ Random Name</span>
            </button>

            {/* Skip Button */}
            <button
              type="button"
              onClick={handleSkip}
              className="text-sm text-gray-400 transition-colors hover:text-gray-300"
            >
              Skip for now (auto-generate)
            </button>
          </div>
        </form>

        {/* Footer Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            🔒 Your info is saved locally on this device
          </p>
        </div>
      </div>
    </div>
  );
}
