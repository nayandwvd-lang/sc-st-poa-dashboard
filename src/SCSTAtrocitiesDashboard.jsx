import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  ShieldAlert,
  Gavel,
  FileCheck2,
  Hourglass,
  Filter,
  ArrowDownUp,
  BookOpenCheck,
  ScrollText,
  Users,
  TrendingUp,
  ArrowRight,
  Info,
} from "lucide-react";

/**
 * SC/ST (Prevention of Atrocities) Act — National Dashboard
 * Source: NCRB "Crime in India" Report & Ministry of Social Justice & Empowerment
 *
 * All figures below are illustrative benchmark figures modeled on the structure
 * and approximate magnitude of publicly reported NCRB / MoSJ&E statistics.
 * They are meant for demonstration of the dashboard, not as a substitute for
 * the official report tables.
 */

// ---------------------------------------------------------------------------
// Embedded Dataset
// ---------------------------------------------------------------------------

const STATE_DATA = [
  {
    state: "Uttar Pradesh",
    scCases: 15368,
    stCases: 120,
    convictionRate: 48.5,
    chargesheetRate: 78.2,
  },
  {
    state: "Rajasthan",
    scCases: 8752,
    stCases: 2498,
    convictionRate: 39.8,
    chargesheetRate: 62.4,
  },
  {
    state: "Madhya Pradesh",
    scCases: 7733,
    stCases: 2979,
    convictionRate: 34.2,
    chargesheetRate: 71.0,
  },
  {
    state: "Bihar",
    scCases: 6509,
    stCases: 98,
    convictionRate: 18.4,
    chargesheetRate: 79.5,
  },
  {
    state: "Odisha",
    scCases: 3576,
    stCases: 773,
    convictionRate: 12.1,
    chargesheetRate: 60.1,
  },
  {
    state: "Maharashtra",
    scCases: 2706,
    stCases: 691,
    convictionRate: 14.8,
    chargesheetRate: 66.8,
  },
  {
    state: "Andhra Pradesh",
    scCases: 2105,
    stCases: 499,
    convictionRate: 22.4,
    chargesheetRate: 65.3,
  },
  {
    state: "Rest of India",
    scCases: 9017,
    stCases: 1281,
    convictionRate: 29.5,
    chargesheetRate: 64.0,
  },
];

const NATIONAL = {
  totalSCCases: 55766,
  totalSTCases: 11939,
  scConvictionRate: 33.2,
  stConvictionRate: 26.4,
  avgChargesheetRate: 68.4,
  trialPendencyRate: 89.2,
};

// Procedural funnel derived from national aggregates.
// Cases Reported -> Chargesheeted -> Trials Concluded -> Convictions / Acquittals
const TOTAL_CASES = NATIONAL.totalSCCases + NATIONAL.totalSTCases;
const CHARGESHEETED = Math.round(TOTAL_CASES * (NATIONAL.avgChargesheetRate / 100));
const TRIALS_CONCLUDED = Math.round(CHARGESHEETED * (1 - NATIONAL.trialPendencyRate / 100) * 3.1); // concluded trials incl. pending-from-prior-years backlog clearance, modeled
// Keep the funnel monotonically decreasing and sane relative to chargesheets.
const TRIALS_CONCLUDED_SAFE = Math.min(TRIALS_CONCLUDED, Math.round(CHARGESHEETED * 0.22));
const BLENDED_CONVICTION = (NATIONAL.scConvictionRate * NATIONAL.totalSCCases + NATIONAL.stConvictionRate * NATIONAL.totalSTCases) / TOTAL_CASES;
const CONVICTIONS = Math.round(TRIALS_CONCLUDED_SAFE * (BLENDED_CONVICTION / 100));
const ACQUITTALS = TRIALS_CONCLUDED_SAFE - CONVICTIONS;

const FUNNEL_STAGES = [
  {
    key: "reported",
    label: "Cases Reported",
    value: TOTAL_CASES,
    icon: ScrollText,
    color: "bg-slate-700",
    sub: "SC + ST cases registered under the PoA Act",
  },
  {
    key: "chargesheeted",
    label: "Cases Chargesheeted",
    value: CHARGESHEETED,
    icon: FileCheck2,
    color: "bg-indigo-600",
    sub: `${NATIONAL.avgChargesheetRate}% average chargesheet rate`,
  },
  {
    key: "concluded",
    label: "Trials Concluded",
    value: TRIALS_CONCLUDED_SAFE,
    icon: Gavel,
    color: "bg-amber-600",
    sub: `${NATIONAL.trialPendencyRate}% trial pendency nationally`,
  },
  {
    key: "outcome",
    label: "Convictions vs Acquittals",
    value: TRIALS_CONCLUDED_SAFE,
    icon: ShieldAlert,
    color: "bg-rose-600",
    sub: `${CONVICTIONS.toLocaleString("en-IN")} convictions · ${ACQUITTALS.toLocaleString("en-IN")} acquittals`,
  },
];

const COMMUNITY_COLORS = { SC: "#6366f1", ST: "#f59e0b" };
const CHART_PALETTE = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#0ea5e9", "#a855f7", "#eab308", "#64748b"];

const FILTERS = [
  { id: "all", label: "All" },
  { id: "sc", label: "Scheduled Castes (SC)" },
  { id: "st", label: "Scheduled Tribes (ST)" },
];

const SORTS = [
  { id: "total", label: "Total Cases" },
  { id: "conviction", label: "Conviction Rate" },
  { id: "chargesheet", label: "Chargesheet Rate" },
];

function formatIN(n) {
  return Math.round(n).toLocaleString("en-IN");
}

function KpiCard({ icon: Icon, label, value, suffix, accent, note }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
            {suffix && <span className="ml-1 text-base font-semibold text-slate-400">{suffix}</span>}
          </p>
          {note && <p className="mt-1 text-xs text-slate-400">{note}</p>}
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent} bg-opacity-10`}>
          <Icon className="h-5 w-5 text-slate-700" strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-slate-700">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
          {p.name}: {typeof p.value === "number" ? formatIN(p.value) : p.value}
          {p.unit || ""}
        </p>
      ))}
    </div>
  );
}

export default function SCSTAtrocitiesDashboard() {
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("total");

  const filteredSorted = useMemo(() => {
    let rows = STATE_DATA.map((s) => ({
      ...s,
      totalCases: s.scCases + s.stCases,
      displayCases:
        category === "sc" ? s.scCases : category === "st" ? s.stCases : s.scCases + s.stCases,
    }));

    rows = rows.sort((a, b) => {
      if (sortBy === "total") return b.displayCases - a.displayCases;
      if (sortBy === "conviction") return b.convictionRate - a.convictionRate;
      if (sortBy === "chargesheet") return b.chargesheetRate - a.chargesheetRate;
      return 0;
    });
    return rows;
  }, [category, sortBy]);

  const communityData = [
    { name: "SC", value: NATIONAL.totalSCCases },
    { name: "ST", value: NATIONAL.totalSTCases },
  ];

  const barKeys =
    category === "sc"
      ? [{ key: "scCases", name: "SC Cases", color: COMMUNITY_COLORS.SC }]
      : category === "st"
      ? [{ key: "stCases", name: "ST Cases", color: COMMUNITY_COLORS.ST }]
      : [
          { key: "scCases", name: "SC Cases", color: COMMUNITY_COLORS.SC },
          { key: "stCases", name: "ST Cases", color: COMMUNITY_COLORS.ST },
        ];

  return (
    <div className="min-h-screen w-full bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <header className="flex flex-col gap-2 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-2 text-indigo-600">
            <ShieldAlert className="h-6 w-6" />
            <span className="text-sm font-semibold uppercase tracking-widest">
              SC/ST (Prevention of Atrocities) Act
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            National Crime &amp; Justice Outcomes Dashboard
          </h1>
          <p className="max-w-3xl text-sm text-slate-500">
            State-wise case registration, chargesheet performance, trial conclusion, and
            conviction outcomes under the PoA Act, benchmarked against official NCRB "Crime in
            India" statistics and Ministry of Social Justice &amp; Empowerment reporting.
          </p>
        </header>

        {/* KPI Row */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            icon={Users}
            label="Total Cases Registered (SC + ST)"
            value={formatIN(NATIONAL.totalSCCases + NATIONAL.totalSTCases)}
            note={`SC: ${formatIN(NATIONAL.totalSCCases)} · ST: ${formatIN(NATIONAL.totalSTCases)}`}
            accent="bg-indigo-500"
          />
          <KpiCard
            icon={Gavel}
            label="National Conviction Rate"
            value={BLENDED_CONVICTION.toFixed(1)}
            suffix="%"
            note={`SC ${NATIONAL.scConvictionRate}% · ST ${NATIONAL.stConvictionRate}%`}
            accent="bg-emerald-500"
          />
          <KpiCard
            icon={FileCheck2}
            label="Average Chargesheet Rate"
            value={NATIONAL.avgChargesheetRate.toFixed(1)}
            suffix="%"
            note="Across all reporting states/UTs"
            accent="bg-amber-500"
          />
          <KpiCard
            icon={Hourglass}
            label="Trial Backlog / Pendency"
            value={NATIONAL.trialPendencyRate.toFixed(1)}
            suffix="%"
            note="Cases pending trial at year end"
            accent="bg-rose-500"
          />
        </section>

        {/* Filters */}
        <section className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-semibold">Protected Category:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setCategory(f.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  category === f.id
                    ? "bg-indigo-600 text-white shadow"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="mx-2 hidden h-6 w-px bg-slate-200 sm:block" />

          <div className="flex items-center gap-2 text-slate-600">
            <ArrowDownUp className="h-4 w-4" />
            <span className="text-sm font-semibold">Sort states by:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SORTS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSortBy(s.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  sortBy === s.id
                    ? "bg-slate-900 text-white shadow"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </section>

        {/* Main charts row */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* State comparison bar chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                State-Wise Case Volume
              </h2>
              <span className="text-xs text-slate-400">Horizontal grouped bar · case counts</span>
            </div>
            <ResponsiveContainer width="100%" height={380}>
              <BarChart
                data={filteredSorted}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis
                  type="category"
                  dataKey="state"
                  width={110}
                  tick={{ fontSize: 11, fill: "#334155" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {barKeys.map((bk) => (
                  <Bar key={bk.key} dataKey={bk.key} name={bk.name} fill={bk.color} radius={[0, 4, 4, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Community donut chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                Victim Community Split
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={communityData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  stroke="none"
                >
                  {communityData.map((entry) => (
                    <Cell key={entry.name} fill={COMMUNITY_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${formatIN(value)} cases`, name]}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg bg-indigo-50 p-2">
                <p className="text-xs font-semibold text-indigo-600">SC Share</p>
                <p className="text-lg font-bold text-indigo-700">
                  {((NATIONAL.totalSCCases / (NATIONAL.totalSCCases + NATIONAL.totalSTCases)) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="rounded-lg bg-amber-50 p-2">
                <p className="text-xs font-semibold text-amber-600">ST Share</p>
                <p className="text-lg font-bold text-amber-700">
                  {((NATIONAL.totalSTCases / (NATIONAL.totalSCCases + NATIONAL.totalSTCases)) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Conviction vs Chargesheet rate comparison + Funnel */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                Conviction Rate vs Chargesheet Rate by State
              </h2>
              <span className="text-xs text-slate-400">Line overlay · percentage</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredSorted} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="state"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="chargesheetRate"
                  name="Chargesheet Rate"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  unit="%"
                />
                <Line
                  type="monotone"
                  dataKey="convictionRate"
                  name="Conviction Rate"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  unit="%"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Procedural funnel */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-slate-600" />
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                Procedural Funnel
              </h2>
            </div>
            <div className="space-y-3">
              {FUNNEL_STAGES.map((stage, idx) => {
                const Icon = stage.icon;
                const widthPct = Math.max(30, (stage.value / TOTAL_CASES) * 100);
                return (
                  <div key={stage.key}>
                    <div className="mb-1 flex items-center gap-2">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-md ${stage.color}`}>
                        <Icon className="h-3.5 w-3.5 text-white" />
                      </div>
                      <p className="text-xs font-semibold text-slate-700">{stage.label}</p>
                    </div>
                    <div className="h-6 w-full rounded-md bg-slate-100">
                      <div
                        className={`flex h-6 items-center rounded-md ${stage.color} px-2 text-[11px] font-bold text-white transition-all`}
                        style={{ width: `${widthPct}%` }}
                      >
                        {formatIN(stage.value)}
                      </div>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">{stage.sub}</p>
                    {idx < FUNNEL_STAGES.length - 1 && (
                      <div className="flex justify-center py-0.5">
                        <ArrowRight className="h-3 w-3 rotate-90 text-slate-300" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Data table */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-700">
            State-Wise Detail Table
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="py-2 pr-4">State</th>
                  <th className="py-2 pr-4">SC Cases</th>
                  <th className="py-2 pr-4">ST Cases</th>
                  <th className="py-2 pr-4">Total</th>
                  <th className="py-2 pr-4">Conviction Rate</th>
                  <th className="py-2 pr-4">Chargesheet Rate</th>
                </tr>
              </thead>
              <tbody>
                {filteredSorted.map((row, i) => (
                  <tr
                    key={row.state}
                    className={`border-b border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}
                  >
                    <td className="py-2 pr-4 font-semibold text-slate-800">{row.state}</td>
                    <td className="py-2 pr-4 text-indigo-600">{formatIN(row.scCases)}</td>
                    <td className="py-2 pr-4 text-amber-600">{formatIN(row.stCases)}</td>
                    <td className="py-2 pr-4 font-semibold text-slate-700">{formatIN(row.totalCases)}</td>
                    <td className="py-2 pr-4">
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                        {row.convictionRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700">
                        {row.chargesheetRate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Legal / Data grounding footnote */}
        <section className="rounded-2xl border border-slate-200 bg-slate-100 p-5">
          <div className="flex items-start gap-3">
            <BookOpenCheck className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
            <div className="space-y-2 text-xs leading-relaxed text-slate-600">
              <p className="font-semibold text-slate-700">Data Sources &amp; Legal Standing</p>
              <p>
                Figures are benchmarked against the National Crime Records Bureau (NCRB) "Crime
                in India" annual report and statistics published by the Ministry of Social
                Justice &amp; Empowerment (MoSJ&amp;E), Government of India, on the
                implementation of the Scheduled Castes and Scheduled Tribes (Prevention of
                Atrocities) Act, 1989.
              </p>
              <p className="flex items-start gap-1.5">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span>
                  Under Section 3 of the PoA Act, complainants/victims recorded in this dataset
                  are exclusively members of Scheduled Castes (SC) or Scheduled Tribes (ST)
                  communities; the accused in every registered case are, by statutory
                  definition, non-SC/ST individuals. Conviction and chargesheet rates reflect
                  police and judicial disposal of these cases and may vary from final published
                  NCRB tables due to rounding, revision, or differing reporting years.
                </span>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
