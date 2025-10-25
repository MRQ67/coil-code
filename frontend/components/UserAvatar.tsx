/**
 * UserAvatar Component
 * Displays user avatar with gender-specific styling, caching, and preloading
 */

"use client";

import React, { useState, useEffect } from "react";
import { getAvatarUrl, type Gender } from "@/lib/name-generator";
import { getCachedAvatar, preloadAndCacheAvatar } from "@/lib/avatar-cache";

interface UserAvatarProps {
  username: string;
  gender: Gender;
  size?: number;
  className?: string;
  showTooltip?: boolean;
}

export default function UserAvatar({
  username,
  gender,
  size = 40,
  className = "",
  showTooltip = false,
}: UserAvatarProps) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load avatar with caching
  useEffect(() => {
    if (!username) {
      return;
    }

    let mounted = true;

    const loadAvatar = async () => {
      if (mounted) {
        setIsLoading(true);
        setImageError(false);
      }

      try {
        // Check cache first
        const cachedUrl = getCachedAvatar(username, gender);

        if (cachedUrl) {
          // Use cached URL immediately
          if (mounted) {
            setImageUrl(cachedUrl);
            setIsLoading(false);
          }
          return;
        }

        // Generate new URL
        const url = getAvatarUrl(username, gender);

        // Preload and cache the avatar
        await preloadAndCacheAvatar(username, gender, url);

        if (mounted) {
          setImageUrl(url);
          setIsLoading(false);
        }
      } catch (error) {
        console.warn("Error loading avatar:", error);
        if (mounted) {
          // Still set the URL even if preload fails
          const url = getAvatarUrl(username, gender);
          setImageUrl(url);
          setIsLoading(false);
        }
      }
    };

    loadAvatar();

    return () => {
      mounted = false;
    };
  }, [username, gender]);

  // Fallback initials if image fails to load
  const getInitials = (name: string): string => {
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Gender-specific colors for fallback
  const getGenderColor = (genderType: Gender): string => {
    switch (genderType) {
      case "boy":
        return "bg-blue-500";
      case "girl":
        return "bg-pink-500";
      case "random":
      default:
        return "bg-purple-500";
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size }}
      title={showTooltip ? username : undefined}
    >
      {!imageError && imageUrl ? (
        <>
          {/* Loading skeleton */}
          {isLoading && (
            <div
              className={`absolute inset-0 animate-pulse rounded-full ${getGenderColor(gender)}/30`}
              style={{ width: size, height: size }}
            />
          )}

          {/* Avatar image */}
          <img
            src={imageUrl}
            alt={`${username}'s avatar`}
            className={`rounded-full object-cover transition-opacity duration-300 ${
              isLoading ? "opacity-0" : "opacity-100"
            }`}
            style={{ width: size, height: size }}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="eager"
          />
        </>
      ) : (
        // Fallback to initials if image fails or no URL
        <div
          className={`flex items-center justify-center rounded-full ${getGenderColor(gender)} text-white font-semibold transition-opacity duration-300`}
          style={{
            width: size,
            height: size,
            fontSize: size * 0.4,
          }}
        >
          {username ? getInitials(username) : "?"}
        </div>
      )}

      {/* Gender indicator badge (optional subtle badge) */}
      {gender !== "random" && !imageError && (
        <div
          className={`absolute bottom-0 right-0 rounded-full border-2 border-white ${
            gender === "boy" ? "bg-blue-400" : "bg-pink-400"
          } transition-opacity duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          style={{
            width: size * 0.3,
            height: size * 0.3,
            minWidth: 8,
            minHeight: 8,
          }}
        />
      )}
    </div>
  );
}
