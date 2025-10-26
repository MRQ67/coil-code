/**
 * useUsername Hook
 * Manages username and gender preferences with localStorage persistence
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  generateRandomName,
  getRandomGender,
  type Gender,
} from "@/lib/name-generator";

// Storage keys
const USERNAME_STORAGE_KEY = "collaborative-editor-username";
const GENDER_STORAGE_KEY = "collaborative-editor-gender";

// User info interface
export interface UserInfo {
  username: string;
  gender: Gender;
}

/**
 * Hook for managing user information (username and gender)
 * Handles localStorage persistence and provides methods for updating user info
 */
export function useUsername() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user info from localStorage on mount
  useEffect(() => {
    try {
      const savedUsername = localStorage.getItem(USERNAME_STORAGE_KEY);
      const savedGender = localStorage.getItem(
        GENDER_STORAGE_KEY,
      ) as Gender | null;

      if (savedUsername && savedGender) {
        // Valid saved data found
        setUserInfo({
          username: savedUsername,
          gender: savedGender,
        });
      }
    } catch (error) {
      console.error("Error loading user info from localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Saves user information to localStorage and state
   */
  const saveUserInfo = useCallback((name: string, gender: Gender) => {
    try {
      localStorage.setItem(USERNAME_STORAGE_KEY, name);
      localStorage.setItem(GENDER_STORAGE_KEY, gender);

      setUserInfo({ username: name, gender });
    } catch (error) {
      console.error("Error saving user info to localStorage:", error);
    }
  }, []);

  /**
   * Updates existing user information
   */
  const updateUserInfo = useCallback(
    (name: string, gender: Gender) => {
      saveUserInfo(name, gender);
    },
    [saveUserInfo],
  );

  /**
   * Clears user information from localStorage and state
   * Shows the prompt again
   */
  const clearUserInfo = useCallback(() => {
    try {
      localStorage.removeItem(USERNAME_STORAGE_KEY);
      localStorage.removeItem(GENDER_STORAGE_KEY);

      setUserInfo(null);
    } catch (error) {
      console.error("Error clearing user info from localStorage:", error);
    }
  }, []);

  /**
   * Generates random username and gender, then saves them
   */
  const generateRandom = useCallback(() => {
    const randomName = generateRandomName();
    const randomGender = getRandomGender();

    saveUserInfo(randomName, randomGender);
  }, [saveUserInfo]);

  return {
    userInfo,
    isLoading,
    saveUserInfo,
    updateUserInfo,
    clearUserInfo,
    generateRandom,
  };
}
