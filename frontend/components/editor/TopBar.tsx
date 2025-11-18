'use client';

import React from 'react';
import type YPartyKitProvider from 'y-partykit/provider';
import UserListTooltip from './UserListTooltip';
import SaveStatusIndicator from './SaveStatusIndicator';
import ConnectionStatusIndicator from './ConnectionStatusIndicator';
import type { User } from '@/hooks/usePresence';
import type { SaveStatus } from '@/hooks/useAutoSave';

interface TopBarProps {
  roomName?: string;
  userCount?: number;
  users?: User[];
  maxVisibleUsers?: number;
  onEditProfile?: () => void;
  onLeaveRoom?: () => void;
  activeFile?: string;
  fileIcon?: string;
  saveStatus?: SaveStatus;
  provider?: YPartyKitProvider | null;
}

const TopBar: React.FC<TopBarProps> = ({
  roomName = 'Unknown Room',
  userCount = 0,
  users = [],
  maxVisibleUsers = 5,
  onEditProfile,
  onLeaveRoom,
  activeFile = 'index.html',
  fileIcon = '📄',
  saveStatus = 'idle',
  provider = null
}) => {
  return (
    <header className="flex items-center justify-between border-b border-[#3C3C3C] bg-[#2D2D30] px-6 py-3">
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-semibold text-white">
          Coil Code Editor
        </h1>
        <ConnectionStatusIndicator provider={provider} />
        <SaveStatusIndicator status={saveStatus} />
        <div className="text-sm text-gray-400">
          Room: <span className="font-mono text-gray-300">{roomName}</span>
        </div>
        
        {/* Active file indicator - only shown when there's an active file */}
        {activeFile && (
          <div className="text-sm text-gray-400 flex items-center">
            <span className="mr-1">{fileIcon}</span>
            <span>{activeFile}</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {/* Real-time User List with Stacked Avatars */}
        <UserListTooltip users={users} maxVisible={maxVisibleUsers} />

        {/* User Count Badge */}
        <div className="rounded-lg bg-[#252526] px-3 py-2">
          <span className="text-sm text-gray-400">
            {userCount} {userCount === 1 ? "user" : "users"} online
          </span>
        </div>

        {/* Edit Profile Button */}
        <button
          onClick={onEditProfile}
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
        <button
          onClick={onLeaveRoom}
          className="rounded-lg bg-[#252526] px-4 py-2 text-sm text-white transition-colors hover:bg-gray-600"
        >
          Leave Room
        </button>
      </div>
    </header>
  );
};

export default TopBar;