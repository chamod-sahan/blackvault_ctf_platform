'use client';

import { useEffect, useState } from 'react';
import { userApi, submissionApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Trophy, Flag, Calendar, CheckCircle } from 'lucide-react';

interface Solve {
  id: string;
  challenge: {
    id: string;
    title: string;
    category: string;
    difficulty: string;
    points: number;
  };
  solvedAt: string;
}

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [solves, setSolves] = useState<Solve[]>([]);
  const [rank, setRank] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [{ data: solvesData }, { data: lbData }] = await Promise.all([
          submissionApi.getSolves(),
          userApi.getLeaderboard('users'),
        ]);
        setSolves(solvesData.solves);
        
        const userRank = lbData.leaderboard.findIndex(
          (u: { id: string }) => u.id === user?.id
        );
        setRank(userRank >= 0 ? userRank + 1 : null);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };
    fetchData();
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <div className="cyber-card">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-3xl font-bold">
            {user?.username[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.username}</h1>
            <p className="text-muted-foreground">{user?.email}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1">
                <Trophy className="w-4 h-4 text-primary" />
                {user?.points} pts
              </span>
              {rank && (
                <span className="flex items-center gap-1">
                  <span className="text-muted-foreground">Rank</span> #{rank}
                </span>
              )}
              {user?.role === 'ADMIN' && (
                <span className="px-2 py-1 bg-primary/20 text-primary rounded text-sm">
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="cyber-card">
          <div className="flex items-center gap-3">
            <Flag className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Challenges Solved</p>
              <p className="text-2xl font-bold">{solves.length}</p>
            </div>
          </div>
        </div>
        <div className="cyber-card">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Points</p>
              <p className="text-2xl font-bold">{user?.points}</p>
            </div>
          </div>
        </div>
        <div className="cyber-card">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="text-lg font-medium">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="cyber-card">
        <h2 className="text-xl font-semibold mb-4">Solved Challenges</h2>

        {solves.length > 0 ? (
          <div className="space-y-3">
            {solves.map((solve) => (
              <div
                key={solve.id}
                className="flex items-center justify-between p-4 rounded-lg bg-background/50"
              >
                <div className="flex items-center gap-4">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <div>
                    <p className="font-medium">{solve.challenge.title}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{solve.challenge.category}</span>
                      <span>&bull;</span>
                      <span>{solve.challenge.difficulty}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-primary font-bold">
                    +{solve.challenge.points}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {new Date(solve.solvedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No challenges solved yet
          </p>
        )}
      </div>
    </div>
  );
}
