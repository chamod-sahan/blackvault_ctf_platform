'use client';

import { useEffect, useState } from 'react';
import { teamApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useNotificationStore } from '@/lib/store';
import { Users, Plus, LogIn, Crown } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  totalPoints?: number;
  members: {
    id: string;
    role: string;
    user: {
      id: string;
      username: string;
      points: number;
    };
  }[];
}

interface MyTeam extends Team {
  role: string;
}

export default function TeamsPage() {
  const { user } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeam, setMyTeam] = useState<MyTeam | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [joinTeamId, setJoinTeamId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [{ data: teamsData }, { data: myTeamData }] = await Promise.all([
        teamApi.getTeams(),
        teamApi.getMyTeam().catch(() => ({ team: null })),
      ]);
      setTeams(teamsData.teams);
      if (myTeamData.team) {
        setMyTeam({ ...myTeamData.team, role: myTeamData.team.members?.[0]?.role || 'MEMBER' });
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await teamApi.createTeam(teamName);
      addNotification({ type: 'success', message: 'Team created!' });
      setShowCreate(false);
      setTeamName('');
      fetchData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      addNotification({
        type: 'error',
        message: err.response?.data?.error || 'Failed to create team',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await teamApi.joinTeam(joinTeamId);
      addNotification({ type: 'success', message: 'Joined team!' });
      setShowJoin(false);
      setJoinTeamId('');
      fetchData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      addNotification({
        type: 'error',
        message: err.response?.data?.error || 'Failed to join team',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave this team?')) return;
    try {
      await teamApi.leaveTeam();
      addNotification({ type: 'success', message: 'Left team' });
      fetchData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      addNotification({
        type: 'error',
        message: err.response?.data?.error || 'Failed to leave team',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Teams</h1>
          <p className="text-muted-foreground">
            Join forces with other hackers
          </p>
        </div>

        {!myTeam && (
          <div className="flex gap-3">
            <button
              onClick={() => setShowJoin(true)}
              className="cyber-button-secondary flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Join Team
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="cyber-button-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Team
            </button>
          </div>
        )}
      </div>

      {myTeam && (
        <div className="cyber-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              {myTeam.name}
              {myTeam.role === 'LEADER' && (
                <Crown className="w-4 h-4 text-yellow-400" />
              )}
            </h2>
            <button
              onClick={handleLeave}
              className="text-sm text-error hover:underline"
            >
              Leave Team
            </button>
          </div>

          <div className="space-y-3">
            {myTeam.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-lg bg-background/50"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium">{member.user.username}</span>
                  {member.role === 'LEADER' && (
                    <Crown className="w-4 h-4 text-yellow-400" />
                  )}
                </div>
                <span className="text-primary">{member.user.points} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams
          .filter((t) => !myTeam || t.id !== myTeam.id)
          .map((team) => (
            <div key={team.id} className="cyber-card">
              <h3 className="font-semibold text-lg mb-2">{team.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {team.members.length} members
              </p>
              <div className="flex items-center justify-between">
                <span className="text-primary font-bold">
                  {team.totalPoints || 0} pts
                </span>
                {!myTeam && (
                  <button
                    onClick={async () => {
                      try {
                        await teamApi.joinTeam(team.id);
                        addNotification({ type: 'success', message: 'Joined!' });
                        fetchData();
                      } catch (error) {
                        addNotification({
                          type: 'error',
                          message: 'Failed to join',
                        });
                      }
                    }}
                    className="text-sm text-primary hover:underline"
                  >
                    Join
                  </button>
                )}
              </div>
            </div>
          ))}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="cyber-card max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Create Team</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Team name"
                className="cyber-input"
                required
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 cyber-button bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 cyber-button-primary disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showJoin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="cyber-card max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Join Team</h2>
            <form onSubmit={handleJoin} className="space-y-4">
              <input
                type="text"
                value={joinTeamId}
                onChange={(e) => setJoinTeamId(e.target.value)}
                placeholder="Team ID"
                className="cyber-input font-mono"
                required
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowJoin(false)}
                  className="flex-1 cyber-button bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 cyber-button-primary disabled:opacity-50"
                >
                  {submitting ? 'Joining...' : 'Join'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
