import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import Button from "../../../components/ReuseComponents/Button";
import PurchasesListTable from "../Components/PurchaseListTable";
import {
  getDashboardSummary,
  getPurchaseTrend,
  getTopVendors,
  getRecentPurchases,
  getLowStockItems,
  getVariantStockSummary,
  getMonthlyPurchaseSummary,
  getVendorStatusStats,
} from "../Services/purchaseService";

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Tooltip, Legend,
);

// ─── Date helpers ────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split("T")[0];
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
};

// Preset ranges for the quick-filter buttons
const PRESETS = [
  { label: "7D",  startDate: daysAgo(7),   endDate: today() },
  { label: "30D", startDate: daysAgo(30),  endDate: today() },
  { label: "90D", startDate: daysAgo(90),  endDate: today() },
  { label: "1Y",  startDate: daysAgo(365), endDate: today() },
];

// ─── Main Component ──────────────────────────────────────────────────────────
const PurchaseDashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [summary, setSummary]               = useState({});
  const [purchaseTrend, setPurchaseTrend]   = useState([]);
  const [topVendors, setTopVendors]         = useState([]);
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [lowStock, setLowStock]             = useState([]);
  const [variantStock, setVariantStock]     = useState([]);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [vendorStatus, setVendorStatus]     = useState([]);
  const [showAllVariants, setShowAllVariants] = useState(false);

  // Date filter state
  const [startDate, setStartDate] = useState(daysAgo(30));
  const [endDate, setEndDate]     = useState(today());
  const [activePreset, setActivePreset] = useState("30D");

  const loadDashboard = async (start, end) => {
    setLoading(true);
    setError(null);

    try {
      const dateRange = { startDate: start, endDate: end };

      const results = await Promise.allSettled([
        getDashboardSummary(dateRange),
        getPurchaseTrend(dateRange),
        getTopVendors(dateRange),
        getRecentPurchases(dateRange),
        getLowStockItems(),                  // stock snapshot — no date filter
        getVariantStockSummary(),            // stock snapshot — no date filter
        getMonthlyPurchaseSummary(dateRange),
        getVendorStatusStats(),              // vendor config — no date filter
      ]);

      const [
        summaryRes, trendRes, topVendorRes, recentRes,
        lowStockRes, variantStockRes, monthlyRes, vendorStatusRes,
      ] = results.map((r) => (r.status === "fulfilled" ? r.value : null));

      if (summaryRes?.success)     setSummary(summaryRes.data);
      if (trendRes?.success)       setPurchaseTrend(trendRes.data);
      if (topVendorRes?.success)   setTopVendors(topVendorRes.data);
      if (recentRes?.success)      setRecentPurchases(recentRes.data);
      if (lowStockRes?.success)    setLowStock(lowStockRes.data);
      if (variantStockRes?.success) setVariantStock(variantStockRes.data);
      if (monthlyRes?.success)     setMonthlySummary(monthlyRes.data);
      if (vendorStatusRes?.success) setVendorStatus(vendorStatusRes.data);
    } catch (err) {
      console.error("Dashboard load failed:", err);
      setError("Failed to load dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadDashboard(startDate, endDate);
  }, []);

  // Apply a preset quick-filter
  const applyPreset = (preset) => {
    setActivePreset(preset.label);
    setStartDate(preset.startDate);
    setEndDate(preset.endDate);
    loadDashboard(preset.startDate, preset.endDate);
  };

  // Apply custom date range from the date inputs
  const applyCustomRange = () => {
    if (!startDate || !endDate) return;
    if (startDate > endDate) {
      alert("Start date cannot be after end date.");
      return;
    }
    setActivePreset(null); // deselect preset
    loadDashboard(startDate, endDate);
  };

  // Memoized chart data
  const purchaseTrendData = useMemo(() => ({
    labels: purchaseTrend.map((p) => p.date),
    datasets: [{
      label: "Purchase Amount",
      data: purchaseTrend.map((p) => p.total),
      borderColor: "#3b82f6",
      backgroundColor: "#3b82f620",
      tension: 0.3,
      fill: true,
    }],
  }), [purchaseTrend]);

  const monthlySummaryData = useMemo(() => ({
    labels: monthlySummary.map((m) => m.month),
    datasets: [{
      label: "Total Amount",
      data: monthlySummary.map((m) => m.totalAmount),
      backgroundColor: "#10b981aa",
      borderRadius: 6,
    }],
  }), [monthlySummary]);

  const visibleVariants = showAllVariants ? variantStock : variantStock.slice(0, 8);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-500 font-medium">{error}</p>
        <button
          onClick={() => loadDashboard(startDate, endDate)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Purchase Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Complete purchase & vendor overview</p>
        </div>
        <Button buttonName="+ New Purchase" onClick={() => navigate("/purchase/new")} />
      </div>

      {/* ── DATE FILTER BAR ── */}
      <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col sm:flex-row sm:items-end gap-3">
        {/* Preset buttons */}
        <div className="flex gap-2 flex-wrap">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activePreset === p.label
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-8 bg-gray-200" />

        {/* Custom range inputs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-2 flex-1">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 font-medium">From</label>
            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) => { setStartDate(e.target.value); setActivePreset(null); }}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 font-medium">To</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              max={today()}
              onChange={(e) => { setEndDate(e.target.value); setActivePreset(null); }}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <button
            onClick={applyCustomRange}
            className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Apply
          </button>
        </div>

        {/* Active range label */}
        <p className="text-xs text-gray-400 sm:ml-auto whitespace-nowrap">
          {startDate} → {endDate}
        </p>
      </div>

      {/* ── SUMMARY CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard title="Purchases"     value={summary.totalPurchases ?? 0}  icon="🛒" color="from-blue-400 to-blue-600" />
        <SummaryCard title="Total Amount"  value={`₹ ${Number(summary.totalPurchaseAmount || 0).toLocaleString()}`} icon="💰" color="from-green-400 to-green-600" />
        <SummaryCard title="Vendors"       value={summary.totalVendors ?? 0}    icon="🏢" color="from-purple-400 to-purple-600" />
        <SummaryCard title="Items"         value={summary.totalItems ?? 0}      icon="📦" color="from-yellow-400 to-yellow-500" />
      </div>

      {/* ── CHARTS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartSection title="Purchase Trend">
          {purchaseTrend.length === 0 ? <Empty /> : (
            <Line data={purchaseTrendData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
          )}
        </ChartSection>
        <ChartSection title="Monthly Summary">
          {monthlySummary.length === 0 ? <Empty /> : (
            <Bar data={monthlySummaryData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
          )}
        </ChartSection>
      </div>

      {/* ── TOP VENDORS + VENDOR STATUS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ListSection title="Top Vendors">
          {topVendors.length === 0 ? <Empty /> : topVendors.map((v, i) => (
            <Row key={i} left={v.vendorName} right={`₹ ${Number(v.total).toLocaleString()}`} />
          ))}
        </ListSection>
        <ListSection title="Vendor Status">
          {vendorStatus.length === 0 ? <Empty /> : vendorStatus.map((s, i) => (
            <Row key={i} left={s.status} right={s.count} />
          ))}
        </ListSection>
      </div>

      {/* ── STOCK ALERTS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ListSection title="Low Stock Items">
          {lowStock.length === 0
            ? <Empty message="No low stock items 🎉" />
            : lowStock.map((item, idx) => (
                <Row
                  key={idx}
                  left={`${item.itemName} (${item.vendorName || "—"})`}
                  right={<span className="text-red-500 font-bold">Qty: {item.quantity}</span>}
                />
              ))}
        </ListSection>
        <ListSection
          title="Variant Stock"
          action={variantStock.length > 8 && (
            <button
              onClick={() => setShowAllVariants((p) => !p)}
              className="text-xs text-blue-500 hover:underline"
            >
              {showAllVariants ? "Show less" : `+${variantStock.length - 8} more`}
            </button>
          )}
        >
          {variantStock.length === 0 ? <Empty /> : visibleVariants.map((v, idx) => (
            <Row key={idx} left={`${v.itemName} - ${v.size}`} right={`Qty: ${v.quantity}`} />
          ))}
        </ListSection>
      </div>

      {/* ── RECENT PURCHASES ── */}
      <ListSection title="Recent Purchases">
        {recentPurchases.length === 0 ? <Empty /> : recentPurchases.map((p) => (
          <div
            key={p.id}
            onClick={() => navigate(`/purchase/${p.id}`)}
            className="flex justify-between py-2 px-3 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
          >
            <span className="text-gray-700">{p.vendorName}</span>
            <span className="font-semibold text-gray-800">₹ {Number(p.totalAmount).toLocaleString()}</span>
          </div>
        ))}
      </ListSection>

      {/* ── FULL TABLE ── */}
      <PurchasesListTable onView={(row) => navigate(`/purchase/${row.id}`)} />
    </div>
  );
};

/* ─── Sub-components ─────────────────────────────────────────────────────── */

const SummaryCard = ({ title, value, icon, color }) => (
  <div className={`bg-gradient-to-r ${color} text-white p-5 rounded-2xl shadow-lg flex items-center space-x-4`}>
    <div className="text-3xl">{icon}</div>
    <div>
      <p className="text-sm opacity-90">{title}</p>
      <h2 className="text-xl sm:text-2xl font-bold">{value}</h2>
    </div>
  </div>
);

const ChartSection = ({ title, children }) => (
  <div className="bg-white rounded-2xl p-5 shadow-md">
    <h3 className="font-semibold mb-4 text-gray-800">{title}</h3>
    {children}
  </div>
);

const ListSection = ({ title, children, action }) => (
  <div className="bg-white rounded-2xl p-5 shadow-md">
    <div className="flex justify-between items-center mb-3">
      <h3 className="font-semibold text-gray-800">{title}</h3>
      {action}
    </div>
    <div className="space-y-1 text-sm">{children}</div>
  </div>
);

const Row = ({ left, right }) => (
  <div className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
    <span className="text-gray-700">{left}</span>
    <span className="font-medium text-gray-800">{right ?? "—"}</span>
  </div>
);

const Empty = ({ message = "No data available" }) => (
  <p className="text-gray-400 text-sm py-2">{message}</p>
);

const DashboardSkeleton = () => (
  <div className="p-6 space-y-6 bg-gray-50 min-h-screen animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-64" />
    <div className="h-16 bg-gray-200 rounded-2xl" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[...Array(2)].map((_, i) => <div key={i} className="h-56 bg-gray-200 rounded-2xl" />)}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => <div key={i} className="h-40 bg-gray-200 rounded-2xl" />)}
    </div>
  </div>
);

export default PurchaseDashboard;