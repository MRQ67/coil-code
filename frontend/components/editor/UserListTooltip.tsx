/**
 * UserListTooltip Component
 * Displays stacked user avatars with animated tooltips on hover
 * Shows all connected users in the collaboration session
 */

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import UserAvatar from "@/components/UserAvatar";
import type { User } from "@/hooks/usePresence";

interface UserListTooltipProps {
  users: User[];
  maxVisible?: number; // Default: 5 (show max 5 avatars before "+X more")
}

export default function UserListTooltip({
  users,
  maxVisible = 5,
}: UserListTooltipProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isHoveringMore, setIsHoveringMore] = useState(false);

  // Responsive max visible: 3 on mobile, 5 on desktop
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const effectiveMaxVisible = isMobile ? 3 : maxVisible;

  // Calculate visible users and overflow
  const visibleUsers =
    users.length > effectiveMaxVisible
      ? users.slice(0, effectiveMaxVisible - 1)
      : users;
  const hiddenCount =
    users.length > effectiveMaxVisible
      ? users.length - (effectiveMaxVisible - 1)
      : 0;
  const hiddenUsers =
    users.length > effectiveMaxVisible
      ? users.slice(effectiveMaxVisible - 1)
      : [];

  // Loading state with skeleton avatars
  if (users.length === 0) {
    return (
      <div className="flex items-center">
        {/* Multiple skeleton avatars */}
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className="relative h-10 w-10 animate-pulse rounded-full bg-gray-700 ring-2 ring-gray-800"
            style={{
              marginLeft: index === 1 ? 0 : -16,
              zIndex: 4 - index,
            }}
          />
        ))}
        <span className="ml-4 text-sm text-gray-400 animate-pulse">
          Connecting...
        </span>
      </div>
    );
  }

  // Animation variants
  const tooltipVariants = {
    initial: {
      opacity: 0,
      y: -10,
      scale: 0.8,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 260,
        damping: 15,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.8,
      transition: { duration: 0.15 },
    },
  };

  const avatarVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 300, damping: 20 },
    },
    exit: {
      scale: 0,
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  return (
    <div className="flex items-center">
      {/* Visible avatars */}
      <div className="flex items-center">
        <AnimatePresence mode="popLayout">
          {visibleUsers.map((user, index) => (
            <motion.div
              key={user.clientId}
              variants={avatarVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="relative"
              style={{
                zIndex: visibleUsers.length - index,
                marginLeft: index === 0 ? 0 : -16,
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Animated Tooltip */}
              <AnimatePresence>
                {hoveredIndex === index && (
                  <motion.div
                    variants={tooltipVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="absolute top-14 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap"
                  >
                    <div className="relative rounded-lg border border-white/10 bg-black/90 px-3 py-2 shadow-2xl backdrop-blur-md">
                      {/* Gradient decorations */}
                      <div className="absolute inset-x-0 -top-px z-30 mx-auto h-px w-1/2 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
                      <div className="absolute inset-x-0 -top-px z-30 mx-auto h-px w-1/4 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />

                      {/* Content */}
                      <div className="relative z-30">
                        <div className="text-sm font-semibold text-white">
                          {user.username}
                          {user.isCurrentUser && (
                            <span className="ml-1.5 text-xs text-blue-400">
                              (You)
                            </span>
                          )}
                        </div>
                        {user.isCurrentUser && (
                          <div className="text-xs text-gray-400">
                            Current User
                          </div>
                        )}
                      </div>

                      {/* Arrow pointer */}
                      <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-t border-l border-white/10 bg-black/90" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Avatar */}
              <div
                className={`relative transition-all duration-200 ${
                  hoveredIndex === index ? "z-40 scale-110" : ""
                }`}
              >
                <UserAvatar
                  username={user.username}
                  gender={user.gender}
                  size={40}
                  className={`rounded-full transition-all duration-200`}
                  strokeColor={user.color}
                  strokeWidth={user.isCurrentUser ? 4 : 2}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* "+X more" badge */}
      {hiddenCount > 0 && (
        <motion.div
          variants={avatarVariants}
          initial="initial"
          animate="animate"
          className="relative -ml-4"
          style={{ zIndex: 0 }}
          onMouseEnter={() => setIsHoveringMore(true)}
          onMouseLeave={() => setIsHoveringMore(false)}
        >
          {/* Tooltip for hidden users */}
          <AnimatePresence>
            {isHoveringMore && (
              <motion.div
                variants={tooltipVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute top-14 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap"
              >
                <div className="relative max-h-48 overflow-y-auto rounded-lg border border-white/10 bg-black/90 px-3 py-2 shadow-2xl backdrop-blur-md">
                  {/* Gradient decorations */}
                  <div className="absolute inset-x-0 -top-px z-30 mx-auto h-px w-1/2 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

                  {/* Hidden users list */}
                  <div className="relative z-30 space-y-1.5">
                    <div className="mb-1 text-xs font-semibold text-gray-400">
                      {hiddenCount} More User{hiddenCount !== 1 ? "s" : ""}
                    </div>
                    {hiddenUsers.map((user) => (
                      <div
                        key={user.clientId}
                        className="flex items-center gap-2"
                      >
                        <UserAvatar
                          username={user.username}
                          gender={user.gender}
                          size={24}
                          className="rounded-full"
                          strokeColor={user.color}
                          strokeWidth={2}
                        />
                        <span className="text-sm text-white">
                          {user.username}
                          {user.isCurrentUser && (
                            <span className="ml-1 text-xs text-blue-400">
                              (You)
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Arrow pointer */}
                  <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-t border-l border-white/10 bg-black/90" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* "+X" Badge */}
          <div
            className={`
              flex h-10 w-10 items-center justify-center rounded-full
              bg-gray-700 text-sm font-semibold text-white
              ring-2 ring-gray-800 transition-all duration-200
              ${isHoveringMore ? "scale-110 bg-gray-600" : ""}
            `}
          >
            +{hiddenCount}
          </div>
        </motion.div>
      )}
    </div>
  );
}
