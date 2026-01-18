import { useState } from "react";
import { RotateCw } from "lucide-react";
import { health } from "@/services/api";

interface HealthData {
  status: string;
  server: {
    uptime_seconds: number;
    started_at: string;
    current_time: string;
  };
  requests: {
    total: number;
    save: number;
    retrieve: number;
    last_save_at: string | null;
    last_retrieve_at: string | null;
  };
  database: {
    engine: string;
    file: string;
    records: number;
    size_bytes: number;
    size_kb: string;
    size_mb: string;
    last_cleanup_at: string | null;
  };
  memory: {
    rss_mb: string;
    heap_used_mb: string;
    heap_total_mb: string;
  };
  environment: {
    node: string;
    platform: string;
    pid: number;
  };
}

export default function Hp() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const result = await health();
      setData(result);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString() : "—";

  const formatUptime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Server Health</h1>
        <button
          onClick={fetchHealth}
          disabled={loading}
          title="Refresh"
          className="w-9 h-9 flex items-center justify-center rounded-full border hover:bg-muted transition"
        >
          <RotateCw
            className={`w-4 h-4 ${
              loading ? "animate-spin text-muted-foreground" : ""
            }`}
          />
        </button>
      </div>

      {!data && !loading && (
        <div className="text-sm text-muted-foreground">
          Click the refresh button to load server health
        </div>
      )}

      {loading && (
        <div className="text-sm text-muted-foreground">
          Fetching latest server data…
        </div>
      )}

      {data && (
        <>
          {/* Status */}
          <div className="rounded-xl border p-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <span className="text-sm font-medium text-green-600">
              {data.status.toUpperCase()}
            </span>
          </div>

          {/* Server */}
          <div className="rounded-xl border p-4 space-y-2">
            <h2 className="font-medium">Server</h2>
            <div className="text-sm grid grid-cols-2 gap-2">
              <span>Uptime</span>
              <span>{formatUptime(data.server.uptime_seconds)}</span>
              <span>Started At</span>
              <span>{formatTime(data.server.started_at)}</span>
              <span>Current Time</span>
              <span>{formatTime(data.server.current_time)}</span>
            </div>
          </div>

          {/* Requests */}
          <div className="rounded-xl border p-4 space-y-2">
            <h2 className="font-medium">Requests</h2>
            <div className="text-sm grid grid-cols-2 gap-2">
              <span>Total</span>
              <span>{data.requests.total}</span>
              <span>Save</span>
              <span>{data.requests.save}</span>
              <span>Retrieve</span>
              <span>{data.requests.retrieve}</span>
              <span>Last Save</span>
              <span>{formatTime(data.requests.last_save_at)}</span>
              <span>Last Retrieve</span>
              <span>{formatTime(data.requests.last_retrieve_at)}</span>
            </div>
          </div>

          {/* Database */}
          <div className="rounded-xl border p-4 space-y-2">
            <h2 className="font-medium">Database</h2>
            <div className="text-sm grid grid-cols-2 gap-2">
              <span>Engine</span>
              <span>{data.database.engine}</span>
              <span>File</span>
              <span>{data.database.file}</span>
              <span>Records</span>
              <span>{data.database.records}</span>
              <span>Size</span>
              <span>
                {data.database.size_kb} KB ({data.database.size_mb} MB)
              </span>
              <span>Last Cleanup</span>
              <span>{formatTime(data.database.last_cleanup_at)}</span>
            </div>
          </div>

          {/* Memory */}
          <div className="rounded-xl border p-4 space-y-2">
            <h2 className="font-medium">Memory</h2>
            <div className="text-sm grid grid-cols-2 gap-2">
              <span>RSS</span>
              <span>{data.memory.rss_mb} MB</span>
              <span>Heap Used</span>
              <span>{data.memory.heap_used_mb} MB</span>
              <span>Heap Total</span>
              <span>{data.memory.heap_total_mb} MB</span>
            </div>
          </div>

          {/* Environment */}
          <div className="rounded-xl border p-4 space-y-2">
            <h2 className="font-medium">Environment</h2>
            <div className="text-sm grid grid-cols-2 gap-2">
              <span>Node</span>
              <span>{data.environment.node}</span>
              <span>Platform</span>
              <span>{data.environment.platform}</span>
              <span>PID</span>
              <span>{data.environment.pid}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
