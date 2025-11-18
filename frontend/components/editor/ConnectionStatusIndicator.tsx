'use client';

import React, { useState, useEffect } from 'react';
import type YPartyKitProvider from 'y-partykit/provider';

interface ConnectionStatusIndicatorProps {
  provider: YPartyKitProvider | null;
}

type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({ provider }) => {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');

  useEffect(() => {
    if (!provider) {
      setStatus('disconnected');
      return;
    }

    // Update status based on provider status
    const updateStatus = () => {
      // Check if provider is connected via wsconnected property
      if (provider.wsconnected) {
        setStatus('connected');
      } else if (provider.shouldConnect) {
        setStatus('connecting');
      } else {
        setStatus('disconnected');
      }
    };

    // Initial status check
    updateStatus();

    // Listen to provider status changes
    const handleStatusChange = (event: { status: string }) => {
      switch (event.status) {
        case 'connected':
          setStatus('connected');
          break;
        case 'connecting':
          setStatus('connecting');
          break;
        case 'disconnected':
          setStatus('disconnected');
          break;
      }
    };

    // Provider emits 'status' events
    provider.on('status', handleStatusChange);

    // Also listen to sync events for more reliable status
    const handleSync = () => {
      if (provider.wsconnected) {
        setStatus('connected');
      }
    };

    provider.on('sync', handleSync);

    // Cleanup listeners
    return () => {
      provider.off('status', handleStatusChange);
      provider.off('sync', handleSync);
    };
  }, [provider]);

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          text: 'Connected',
          bgColor: 'bg-green-500/20',
          textColor: 'text-green-400',
          dotColor: 'bg-green-500',
        };
      case 'connecting':
        return {
          text: 'Connecting...',
          bgColor: 'bg-yellow-500/20',
          textColor: 'text-yellow-400',
          dotColor: 'bg-yellow-500',
          pulse: true,
        };
      case 'disconnected':
        return {
          text: 'Disconnected',
          bgColor: 'bg-red-500/20',
          textColor: 'text-red-400',
          dotColor: 'bg-red-500',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`flex items-center gap-2 rounded-full ${config.bgColor} px-3 py-1 text-sm ${config.textColor} transition-all duration-200`}>
      <div className="relative">
        <div className={`h-2 w-2 rounded-full ${config.dotColor}`} />
        {config.pulse && (
          <div className={`absolute inset-0 h-2 w-2 rounded-full ${config.dotColor} animate-ping`} />
        )}
      </div>
      <span>{config.text}</span>
    </div>
  );
};

export default ConnectionStatusIndicator;
