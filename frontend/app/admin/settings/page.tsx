'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Save, 
  Loader2, 
  Lock, 
  Radio, 
  CloudLightning,
  AlertTriangle,
} from 'lucide-react';
import { useNotificationStore } from '@/lib/store';
import { adminApi } from '@/lib/api';

export default function AdminSettingsPage() {
  const { addNotification } = useNotificationStore();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    registrationOpen: true,
    maxLoginAttempts: 5,
    sessionTimeout: 24,
    nodeCluster: 'PRIMARY_ALPHA',
    backupFrequency: 'DAILY',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await adminApi.getSettings();
        const s = data.settings;
        setSettings({
          maintenanceMode: s.maintenanceMode === 'true',
          registrationOpen: s.registrationOpen !== 'false',
          maxLoginAttempts: parseInt(s.maxLoginAttempts || '5'),
          sessionTimeout: parseInt(s.sessionTimeout || '24'),
          nodeCluster: s.nodeCluster || 'PRIMARY_ALPHA',
          backupFrequency: s.backupFrequency || 'DAILY',
        });
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setFetching(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminApi.updateSettings({
        maintenanceMode: String(settings.maintenanceMode),
        registrationOpen: String(settings.registrationOpen),
        maxLoginAttempts: String(settings.maxLoginAttempts),
        sessionTimeout: String(settings.sessionTimeout),
        nodeCluster: settings.nodeCluster,
        backupFrequency: settings.backupFrequency,
      });
      addNotification({ type: 'success', message: 'KERNEL_CONFIG_SYNCED: System parameters updated successfully.' });
    } catch (error) {
      addNotification({ type: 'error', message: 'CONFIG_SYNC_FAILED: Core rejected the transaction.' });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
        <p className="text-purple-500 font-mono text-xs tracking-widest animate-pulse">ACCESSING_SYSTEM_PARAMETERS...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-purple-500/20 pb-6">
        <div>
          <div className="flex items-center gap-2 text-purple-500 font-mono text-xs mb-2">
            <ShieldAlert className="w-4 h-4" />
            <span>/root/admin/system_config</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-purple-500">Kernel_Configuration</h1>
          <p className="text-muted-foreground max-w-2xl font-medium">
            Authorized override of platform-wide parameters. Execute changes to service availability and security thresholds.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="htb-card border-purple-500/10">
             <div className="flex items-center gap-3 mb-6">
                <Radio className="w-5 h-5 text-purple-500" />
                <h2 className="font-bold text-sm uppercase tracking-widest">Service_Availability</h2>
             </div>
             
             <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-background/50 border border-htb-border rounded-xl group hover:border-purple-500/30 transition-all">
                   <div>
                      <div className="text-xs font-bold uppercase tracking-tight">Maintenance_Mode</div>
                      <p className="text-[10px] text-muted-foreground font-mono mt-1 uppercase">Restricts all non-admin access</p>
                   </div>
                   <button
                    type="button"
                    onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                    className={`w-12 h-6 rounded-full transition-all relative ${settings.maintenanceMode ? 'bg-red-600' : 'bg-[#1f2029]'}`}
                   >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.maintenanceMode ? 'left-7' : 'left-1'}`} />
                   </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-background/50 border border-htb-border rounded-xl group hover:border-purple-500/30 transition-all">
                   <div>
                      <div className="text-xs font-bold uppercase tracking-tight">Public_Registration</div>
                      <p className="text-[10px] text-muted-foreground font-mono mt-1 uppercase">Allow new operators to join</p>
                   </div>
                   <button
                    type="button"
                    onClick={() => setSettings({...settings, registrationOpen: !settings.registrationOpen})}
                    className={`w-12 h-6 rounded-full transition-all relative ${settings.registrationOpen ? 'bg-green-600' : 'bg-[#1f2029]'}`}
                   >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.registrationOpen ? 'left-7' : 'left-1'}`} />
                   </button>
                </div>
             </div>
          </div>

          <div className="htb-card border-purple-500/10">
             <div className="flex items-center gap-3 mb-6">
                <Lock className="w-5 h-5 text-purple-500" />
                <h2 className="font-bold text-sm uppercase tracking-widest">Security_Thresholds</h2>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Login_Retries</label>
                   <input 
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => setSettings({...settings, maxLoginAttempts: parseInt(e.target.value)})}
                    className="htb-input h-12 border-purple-500/10 bg-background focus:border-purple-500/50"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Session_TTL (Hours)</label>
                   <input 
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                    className="htb-input h-12 border-purple-500/10 bg-background focus:border-purple-500/50"
                   />
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="htb-card border-purple-500/10">
             <div className="flex items-center gap-3 mb-6">
                <CloudLightning className="w-5 h-5 text-purple-500" />
                <h2 className="font-bold text-sm uppercase tracking-widest">Infrastructure_Policy</h2>
             </div>
             
             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Primary_Cluster_ID</label>
                   <select 
                    value={settings.nodeCluster}
                    onChange={(e) => setSettings({...settings, nodeCluster: e.target.value})}
                    className="htb-input h-12 border-purple-500/10 bg-background focus:border-purple-500/50"
                   >
                      <option value="PRIMARY_ALPHA">ALPHA_CLUSTER (US-EAST)</option>
                      <option value="PRIMARY_BETA">BETA_CLUSTER (EU-WEST)</option>
                      <option value="PRIMARY_GAMMA">GAMMA_CLUSTER (AS-SOUTH)</option>
                   </select>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Archive_Schedule</label>
                   <select 
                    value={settings.backupFrequency}
                    onChange={(e) => setSettings({...settings, backupFrequency: e.target.value})}
                    className="htb-input h-12 border-purple-500/10 bg-background focus:border-purple-500/50"
                   >
                      <option value="HOURLY">Realtime_Mirroring</option>
                      <option value="DAILY">Daily_Snapshots</option>
                      <option value="WEEKLY">Weekly_Archives</option>
                   </select>
                </div>
             </div>
          </div>

          <div className="htb-card bg-purple-500/5 border-purple-500/20">
             <div className="flex items-start gap-4 mb-6">
                <AlertTriangle className="w-6 h-6 text-purple-500 shrink-0" />
                <div>
                   <h3 className="font-bold text-xs uppercase tracking-widest text-purple-500">Global_Override_Warning</h3>
                   <p className="text-[10px] font-mono text-muted-foreground mt-1 leading-relaxed uppercase">
                     Committing these parameters will propagate changes across all system nodes and affect active operator sessions.
                   </p>
                </div>
             </div>
             
             <button
              type="submit"
              disabled={loading}
              className="w-full htb-button-primary bg-purple-500 text-white hover:bg-purple-600 shadow-purple-500/20 h-14 uppercase"
             >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <span className="flex items-center gap-2 font-black italic tracking-tighter text-lg"><Save className="w-5 h-5" /> Commit_Global_Config</span>
                )}
             </button>
          </div>
        </div>
      </form>
    </div>
  );
}
