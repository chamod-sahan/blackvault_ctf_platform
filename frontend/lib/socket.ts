import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = () => {
  if (typeof window === 'undefined') return null;

  if (!socket) {
    socket = io({
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  return socket;
};

export const getSocket = () => socket;

export const joinUserRoom = (userId: string) => {
  socket?.emit('join', userId);
};

export const onChallengeSolved = (callback: (data: {
  challengeId: string;
  challengeTitle: string;
  userId: string;
  username: string;
  points: number;
}) => void) => {
  socket?.on('challenge:solved', callback);
  return () => {
    socket?.off('challenge:solved', callback);
  };
};

export const onLeaderboardUpdate = (callback: (data: unknown) => void) => {
  socket?.on('leaderboard:update', callback);
  return () => {
    socket?.off('leaderboard:update', callback);
  };
};
