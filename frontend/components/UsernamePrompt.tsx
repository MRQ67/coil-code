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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md bg-[#222831] border-[#3C3C3C] text-white [&>button]:text-white"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#DFD0B8]">
            <svg
              className="h-6 w-6 text-[#222831]"
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
          <DialogTitle className="text-center text-2xl font-bold text-white">Welcome!</DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            Choose your identity for collaboration
          </DialogDescription>
        </DialogHeader>

        {/* Live Avatar Preview */}
        <div className="my-4 flex justify-center">
          <div className="relative rounded-xl bg-[#393E46] p-4 border border-[#3C3C3C]">
            {debouncedName ? (
              <UserAvatar username={debouncedName} gender={gender} size={80} />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#222831]">
                <svg
                  className="h-10 w-10 text-gray-500"
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
              <div className="absolute bottom-2 right-2 rounded-full bg-[#DFD0B8] p-1">
                <svg
                  className="h-4 w-4 animate-spin text-[#222831]"
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

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-gray-300">
              Your Name
            </Label>
            <Input
              id="username"
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Enter your name..."
              className={`bg-[#393E46] border-[#3C3C3C] text-white placeholder-gray-500 focus-visible:ring-[#DFD0B8] ${
                error ? "border-red-500 focus-visible:ring-red-500" : ""
              }`}
              maxLength={20}
              autoFocus
            />
            {error ? (
              <p className="text-sm text-red-400">{error}</p>
            ) : (
              <p className="text-xs text-gray-500 text-right">
                {name.length}/20 characters
              </p>
            )}
          </div>

          {/* Gender Selection */}
          <div className="space-y-2">
            <Label className="text-gray-300">Avatar Style</Label>
            <div className="grid grid-cols-3 gap-3">
              {/* Boy Option */}
              <button
                type="button"
                onClick={() => handleGenderChange("boy")}
                className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 transition-all ${
                  gender === "boy"
                    ? "border-[#DFD0B8] bg-[#DFD0B8]/10 text-[#DFD0B8]"
                    : "border-[#3C3C3C] bg-[#393E46] text-gray-400 hover:border-gray-500 hover:bg-[#2D2D30]"
                }`}
              >
                <span className="mb-2 text-2xl">👦</span>
                <span className="text-xs font-medium">Boy</span>
              </button>

              {/* Girl Option */}
              <button
                type="button"
                onClick={() => handleGenderChange("girl")}
                className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 transition-all ${
                  gender === "girl"
                    ? "border-[#DFD0B8] bg-[#DFD0B8]/10 text-[#DFD0B8]"
                    : "border-[#3C3C3C] bg-[#393E46] text-gray-400 hover:border-gray-500 hover:bg-[#2D2D30]"
                }`}
              >
                <span className="mb-2 text-2xl">👧</span>
                <span className="text-xs font-medium">Girl</span>
              </button>

              {/* Random Option */}
              <button
                type="button"
                onClick={() => handleGenderChange("random")}
                className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 transition-all ${
                  gender === "random"
                    ? "border-[#DFD0B8] bg-[#DFD0B8]/10 text-[#DFD0B8]"
                    : "border-[#3C3C3C] bg-[#393E46] text-gray-400 hover:border-gray-500 hover:bg-[#2D2D30]"
                }`}
              >
                <span className="mb-2 text-2xl">🎲</span>
                <span className="text-xs font-medium">Random</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            {/* Continue Button */}
            <Button
              type="submit"
              className="w-full bg-[#DFD0B8] text-[#222831] hover:bg-[#d0c1a9] font-semibold h-11"
            >
              Continue
            </Button>

            {/* Random Name Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleRandomName}
              className="w-full border-[#3C3C3C] bg-[#393E46] text-gray-300 hover:bg-[#2D2D30] hover:text-white"
            >
              ✨ Random Name
            </Button>

            {/* Skip Button */}
            <button
              type="button"
              onClick={handleSkip}
              className="text-sm text-gray-500 transition-colors hover:text-[#DFD0B8] hover:underline"
            >
              Skip for now (auto-generate)
            </button>
          </div>
        </form>

        {/* Footer Info */}
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-600">
            🔒 Your info is saved locally on this device
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
