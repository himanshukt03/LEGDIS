import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { Activity, CloudLightning, Globe2, Layers, MapPin, ShieldCheck, Zap } from 'lucide-react';
import { storage } from '../lib/storage';
import type { EvidenceRecord } from '../types';

interface MapLocation {
  id: string;
  label: string;
  x: number;
  y: number;
  region: string;
  iso: string;
  latencyRange: [number, number];
  color: string;
}

interface LocationMetric extends MapLocation {
  shards: number;
  dataVolume: number;
  availability: number;
  latency: number;
}

interface ShardEvent {
  id: string;
  locationId: string;
  locationLabel: string;
  timestamp: string;
  description: string;
  chunkCount: number;
}

const mapLocations: MapLocation[] = [
  { id: 'nyc', label: 'US-East Authority', x: 33, y: 38, region: 'North America', iso: 'USA', latencyRange: [28, 42], color: 'rgba(96, 165, 250, 0.9)' },
  { id: 'mtl', label: 'Canadian Custody Mesh', x: 30, y: 27, region: 'North America', iso: 'CAN', latencyRange: [34, 48], color: 'rgba(129, 140, 248, 0.9)' },
  { id: 'lon', label: 'UK Sovereign Vault', x: 52, y: 32, region: 'Europe', iso: 'GBR', latencyRange: [22, 36], color: 'rgba(14, 165, 233, 0.9)' },
  { id: 'fra', label: 'EU Evidence Ring', x: 57, y: 39, region: 'Europe', iso: 'DEU', latencyRange: [26, 34], color: 'rgba(34, 197, 94, 0.9)' },
  { id: 'auh', label: 'Middle East Chain Terminal', x: 68, y: 46, region: 'Middle East', iso: 'ARE', latencyRange: [48, 66], color: 'rgba(74, 222, 128, 0.88)' },
  { id: 'mum', label: 'India Compliance Grid', x: 71, y: 54, region: 'Asia', iso: 'IND', latencyRange: [52, 72], color: 'rgba(16, 185, 129, 0.88)' },
  { id: 'sin', label: 'APAC Transparency Edge', x: 78, y: 60, region: 'Asia', iso: 'SGP', latencyRange: [60, 78], color: 'rgba(45, 212, 191, 0.9)' },
  { id: 'syd', label: 'Australia Forensic Hub', x: 85, y: 76, region: 'Oceania', iso: 'AUS', latencyRange: [88, 112], color: 'rgba(56, 189, 248, 0.85)' },
  { id: 'bog', label: 'LATAM Evidence Spine', x: 24, y: 60, region: 'South America', iso: 'COL', latencyRange: [68, 96], color: 'rgba(59, 130, 246, 0.88)' },
];

const mapConnections: [string, string][] = [
  ['nyc', 'lon'],
  ['nyc', 'fra'],
  ['lon', 'fra'],
  ['fra', 'auh'],
  ['auh', 'mum'],
  ['mum', 'sin'],
  ['sin', 'syd'],
  ['nyc', 'mtl'],
  ['mtl', 'bog'],
];

function hashSeed(seed: string): number {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 1_000_000_007;
  }
  return hash;
}

function seededFloat(seed: string): number {
  return (hashSeed(seed) % 10_000) / 10_000;
}

function selectUniqueIndexes(seed: string, count: number, limit: number): number[] {
  const indexSet = new Set<number>();
  let attempt = 0;
  while (indexSet.size < Math.min(count, limit)) {
    const candidate = (hashSeed(`${seed}-${attempt}`) + attempt * 7) % limit;
    indexSet.add(candidate);
    attempt += 1;
    if (attempt > 50) {
      break;
    }
  }
  return Array.from(indexSet);
}

function tintColor(color: string, intensity: number): string {
  const match = color.match(/rgba?\(([^)]+)\)/);
  if (!match) {
    return color;
  }
  const parts = match[1].split(',').map((value) => Number(value.trim()));
  const [r, g, b] = parts;
  const alpha = Math.min(0.95, 0.35 + intensity * 0.55);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function computeDistribution(records: EvidenceRecord[]) {
  const metrics: LocationMetric[] = mapLocations.map((location) => ({
    ...location,
    shards: 0,
    dataVolume: 0,
    availability: 99.97,
    latency: (location.latencyRange[0] + location.latencyRange[1]) / 2,
  }));

  const events: ShardEvent[] = [];

  records.forEach((record) => {
    const seed = `${record.id}-${record.blockId ?? ''}`;
    const chunkEstimateBase = record.fileSize > 0 ? record.fileSize / 1_200_000 : record.fileName.length / 4;
    const chunkCount = Math.max(3, Math.min(12, Math.round(chunkEstimateBase) + 3));
    const dataVolumeMb = (record.fileSize || record.fileName.length * 2_048) / (1024 * 1024);

    const nodeIndexes = selectUniqueIndexes(seed, 3, metrics.length);

    nodeIndexes.forEach((index, position) => {
      const metric = metrics[index];
      const share = chunkCount / nodeIndexes.length;
      metric.shards += share;
      metric.dataVolume += dataVolumeMb / nodeIndexes.length;
      const projectedLatency = metric.latencyRange[0] + seededFloat(`${seed}-${metric.id}-${position}`) * (metric.latencyRange[1] - metric.latencyRange[0]);
      metric.latency = metric.latency * 0.65 + projectedLatency * 0.35;
      metric.availability = 99.94 + seededFloat(`${metric.id}-${seed}`) * 0.05;
    });

    if (nodeIndexes.length > 0) {
      const primary = metrics[nodeIndexes[0]];
      events.push({
        id: record.id,
        locationId: primary.id,
        locationLabel: primary.label,
        timestamp: record.createdAt,
        description: `${chunkCount} shards anchored across ${nodeIndexes.length} jurisdictions`,
        chunkCount,
      });
    }
  });

  const totalShards = metrics.reduce((sum, metric) => sum + metric.shards, 0);
  const totalDataVolume = metrics.reduce((sum, metric) => sum + metric.dataVolume, 0);
  const avgLatency = totalShards > 0
    ? metrics.reduce((sum, metric) => sum + metric.latency * metric.shards, 0) / totalShards
    : metrics.length > 0
      ? metrics.reduce((sum, metric) => sum + metric.latency, 0) / metrics.length
      : 0;

  return {
    metrics,
    totals: {
      totalShards,
      totalDataVolume,
      avgLatency,
    },
    events: events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 6),
  };
}

export default function GlobalMapPage() {
  const [evidence, setEvidence] = useState<EvidenceRecord[]>([]);

  useEffect(() => {
    setEvidence(storage.getEvidence());
  }, []);

  const { metrics, totals, events } = useMemo(() => computeDistribution(evidence), [evidence]);

  const activeLocations = metrics.filter((metric) => metric.shards > 0.35);
  const regionsCovered = new Set(activeLocations.map((metric) => metric.region)).size;
  const topLocations = [...metrics]
    .sort((a, b) => b.shards - a.shards)
    .slice(0, 4);

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-50">Global chunk map</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          icon={<Layers className="h-5 w-5" />}
          label="Shards in circulation"
          value={Math.round(totals.totalShards || 0).toLocaleString()}
          sublabel="Total encrypted partitions"
        />
        <StatCard
          icon={<Globe2 className="h-5 w-5" />}
          label="Active jurisdictions"
          value={regionsCovered === 0 ? '—' : regionsCovered.toString()}
          sublabel="Distinct geopolitical zones"
        />
        <StatCard
          icon={<Zap className="h-5 w-5" />}
          label="Mesh latency"
          value={totals.avgLatency > 0 ? `${Math.round(totals.avgLatency)} ms` : '—'}
          sublabel="Weighted mean replication time"
        />
        <StatCard
          icon={<CloudLightning className="h-5 w-5" />}
          label="Distributed payload"
          value={`${totals.totalDataVolume <= 0 ? '—' : totals.totalDataVolume.toFixed(1)} MB`}
          sublabel="Aggregate encrypted storage"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.7fr_1fr]">
        <section className="map-surface relative h-[420px] overflow-hidden border border-neutral-800/60 bg-neutral-950/90 p-6">
          <div className="map-gridline" />
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {mapConnections.map(([sourceId, targetId]) => {
              const source = metrics.find((metric) => metric.id === sourceId);
              const target = metrics.find((metric) => metric.id === targetId);
              if (!source || !target) {
                return null;
              }
              const midX = (source.x + target.x) / 2;
              const midY = Math.min(source.y, target.y) - 12;
              const strokeOpacity = Math.min(0.65, 0.2 + Math.max(source.shards, target.shards) / 18);
              return (
                <path
                  key={`${sourceId}-${targetId}`}
                  d={`M ${source.x} ${source.y} Q ${midX} ${midY} ${target.x} ${target.y}`}
                  fill="none"
                  stroke={`rgba(125, 211, 252, ${strokeOpacity})`}
                  strokeWidth={0.8}
                  className="map-paths"
                />
              );
            })}
          </svg>

          {metrics.map((metric) => {
            const intensity = Math.min(1, metric.shards / 12);
            const nodeSize = 0.9 + intensity * 1.1;
            const color = tintColor(metric.color, Math.max(intensity, 0.35));
            return (
              <div
                key={metric.id}
                className="map-node"
                style={{
                  left: `${metric.x}%`,
                  top: `${metric.y}%`,
                  '--node-size': `${nodeSize}rem`,
                  '--node-color': color,
                } as CSSProperties}
              >
                <div className="map-node-label">
                  <span>
                    {metric.label}
                    {metric.shards > 0 ? ` · ${Math.round(metric.shards)} shards` : ''}
                  </span>
                </div>
              </div>
            );
          })}

          <div className="pointer-events-none absolute inset-x-6 bottom-6 flex items-center gap-4 text-xs text-neutral-300/80">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-300" />
              Active replication ring
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-sky-300" />
              Latency-weighted path
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-neutral-200/70" />
              Dormant standby site
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-100">
              <ShieldCheck className="h-5 w-5 text-emerald-300" /> Highest assurance enclaves
            </h2>
            <div className="space-y-4">
              {topLocations.map((metric) => (
                <div key={metric.id} className="space-y-2 rounded-xl border border-neutral-800/70 bg-neutral-900/60 p-4">
                  <div className="flex items-center justify-between text-sm text-neutral-300">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-neutral-500" />
                      <span className="font-medium text-neutral-100">{metric.label}</span>
                    </div>
                    <span className="text-xs text-neutral-500">{metric.region}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span>{Math.round(metric.shards)} shards</span>
                    <span>{metric.availability.toFixed(2)}% availability</span>
                    <span>{Math.round(metric.latency)} ms</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800/80">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400"
                      style={{ width: `${Math.min(100, (metric.shards / (totals.totalShards || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
              {topLocations.length === 0 && (
                <p className="text-sm text-neutral-500">Upload evidence to seed the shard perimeter.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sublabel }: { icon: React.ReactNode; label: string; value: string; sublabel: string }) {
  return (
    <div className="card flex flex-col gap-3 p-5">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-800/70 bg-neutral-900/70 text-neutral-200">
        {icon}
      </span>
      <div>
        <p className="text-2xl font-semibold text-neutral-100">{value}</p>
        <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">{label}</p>
      </div>
      <p className="text-xs text-neutral-500">{sublabel}</p>
    </div>
  );
}
