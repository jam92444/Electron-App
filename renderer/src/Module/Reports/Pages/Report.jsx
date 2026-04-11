import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n ?? 0);

const fmtShort = (n = 0) => {
  n = n ?? 0;
  if (Math.abs(n) >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`;
  if (Math.abs(n) >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
  if (Math.abs(n) >= 1e3) return `₹${(n / 1e3).toFixed(1)}K`;
  return `₹${n}`;
};

const pct = (part, whole) =>
  whole ? ((part / whole) * 100).toFixed(1) + "%" : "0%";
const todayEnd = () => {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString().slice(0, 19).replace("T", " "); // 'YYYY-MM-DD HH:MM:SS'
};
const monthStart = () => {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
};

const COLORS = [
  "#6366f1",
  "#22d3ee",
  "#f59e0b",
  "#10b981",
  "#f43f5e",
  "#a78bfa",
  "#34d399",
];

const PRESETS = [
  { label: "This Month", start: monthStart(), end: todayEnd() },
  {
    label: "Last Month",
    start: (() => {
      const d = new Date();
      d.setMonth(d.getMonth() - 1, 1);
      return d.toISOString().slice(0, 10);
    })(),
    end: (() => {
      const d = new Date();
      d.setDate(0);
      return d.toISOString().slice(0, 10);
    })(),
  },
  {
    label: "Last 90 Days",
    start: (() => {
      const d = new Date();
      d.setDate(d.getDate() - 90);
      return d.toISOString().slice(0, 10);
    })(),
    end: todayEnd(),
  },
  {
    label: "This Year",
    start: `${new Date().getFullYear()}-01-01`,
    end: todayEnd(),
  },
];

// ─── sub-components ───────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color = "#6366f1", icon }) => (
  <div
    style={{
      background: "white",
      borderRadius: 16,
      padding: "20px 24px",
      border: "1px solid #f1f5f9",
      boxShadow: "0 1px 4px rgba(0,0,0,.06)",
      display: "flex",
      flexDirection: "column",
      gap: 8,
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#94a3b8",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 20 }}>{icon}</span>
    </div>
    <div
      style={{
        fontSize: 26,
        fontWeight: 800,
        color: "#0f172a",
        lineHeight: 1.1,
      }}
    >
      {value}
    </div>
    {sub && <div style={{ fontSize: 12, color: "#64748b" }}>{sub}</div>}
    <div
      style={{
        height: 3,
        borderRadius: 9,
        background: color,
        marginTop: 4,
        opacity: 0.7,
      }}
    />
  </div>
);

const SectionHeader = ({ title, sub }) => (
  <div style={{ marginBottom: 16 }}>
    <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1e293b" }}>
      {title}
    </h2>
    {sub && (
      <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>{sub}</p>
    )}
  </div>
);

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#1e293b",
        borderRadius: 10,
        padding: "10px 14px",
        fontSize: 12,
        color: "white",
        boxShadow: "0 8px 24px rgba(0,0,0,.3)",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 4, color: "#cbd5e1" }}>
        {label}
      </div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || "#fff" }}>
          {p.name}: {fmtShort(p.value)}
        </div>
      ))}
    </div>
  );
};

// ─── main ─────────────────────────────────────────────────────────────────────
const Report = () => {
  const printRef = useRef(null);
  const [startDate, setStartDate] = useState(monthStart());
  const [endDate, setEndDate] = useState(todayEnd());
  const [activePreset, setActivePreset] = useState("This Month");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── state aligned to ACTUAL response shapes ──────────────────────────────
  // getSalesDashboard → { success, totals, paymentModes, topItems }
  const [salesTotals, setSalesTotals] = useState(null);
  const [paymentModes, setPaymentModes] = useState([]);
  const [topSellingItems, setTopSellingItems] = useState([]);

  // getExpensesByDateRange → { success, data: [{expense_date,amount,description,category_name,...}] }
  const [expenses, setExpenses] = useState([]);

  // getTopVendors → { success, data: [{vendorName,total,purchaseCount}] }
  const [topVendors, setTopVendors] = useState([]);

  // getMonthlyPurchaseSummary → { success, data: [{month,purchaseCount,totalAmount}] }
  const [monthlyPurchases, setMonthlyPurchases] = useState([]);

  // getVariantStockSummary → { success, data: [{itemName,size,quantity}] }
  const [variantStock, setVariantStock] = useState([]);

  // getDashboardData → { success, data: { summary:{totalVendors,totalItems,totalStock,totalPurchases,totalPurchaseAmount}, purchaseTrend:[{date,total}], ... } }
  const [dashSummary, setDashSummary] = useState(null);
  const [purchaseTrend, setPurchaseTrend] = useState([]);

  // Profit & Loss data from getProfitLoss API
  const [profitLossData, setProfitLossData] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const range = { startDate, endDate: endDate + " 23:59:59" };
      const [salesRes, expRes, vendRes, monthRes, varRes, dashRes, plRes] =
        await Promise.all([
          window.api.getSalesDashboard(startDate, endDate).catch((e) => {
            console.error("sales", e);
            return null;
          }),
          window.api.getExpensesByDateRange(range).catch((e) => {
            console.error("exp", e);
            return { data: [] };
          }),
          window.api
            .getTopVendors({ startDate, endDate, limit: 8 })
            .catch((e) => {
              console.error("vendors", e);
              return { data: [] };
            }),
          window.api
            .getMonthlyPurchaseSummary({ startDate, endDate })
            .catch((e) => {
              console.error("monthly", e);
              return { data: [] };
            }),
          window.api.getVariantStockSummary().catch((e) => {
            console.error("variant", e);
            return { data: [] };
          }),
          window.api.getDashboardData({ startDate, endDate }).catch((e) => {
            console.error("dash", e);
            return null;
          }),
          window.api.getProfitLoss({ startDate, endDate }).catch((e) => {
            console.error("profitloss", e);
            return null;
          }),
        ]);
      // salesRes, expRes, vendRes, monthRes, varRes, dashRes, plRes
      if (salesRes?.success) {
        // console.log(salesRes, "Sales data");
        setSalesTotals(salesRes.totals ?? null);
        setPaymentModes(salesRes.paymentModes ?? []);
        setTopSellingItems(salesRes.topItems ?? []);
      } else {
        setSalesTotals(null);
        setPaymentModes([]);
        setTopSellingItems([]);
      }

      // getExpensesByDateRange: { success, data: [...] }
      setExpenses(expRes?.expenses ?? []);
      // getTopVendors: { success, data: [...] }
      setTopVendors(vendRes?.data ?? []);

      // getMonthlyPurchaseSummary: { success, data: [...] }
      setMonthlyPurchases(monthRes?.data ?? []);

      // getVariantStockSummary: { success, data: [...] }
      setVariantStock(varRes?.data ?? []);

      // getDashboardData: { success, data: { summary, purchaseTrend } }
      if (dashRes?.success) {
        setDashSummary(dashRes.data?.summary ?? null);
        // console.log(dashRes.data);
        setPurchaseTrend(dashRes.data?.purchaseTrend ?? []);
      } else {
        setDashSummary(null);
        setPurchaseTrend([]);
      }

      // getProfitLoss: { success, data: { totalSales, grossProfit, totalExpenses, netProfit } }
      if (plRes?.success) {
        setProfitLossData(plRes.data ?? null);
      } else {
        setProfitLossData(null);
      }
    } catch (e) {
      console.error("loadData", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── computed ──────────────────────────────────────────────────────────────
  // salesTotals: { totalBills, totalSales, totalDiscount, totalPieces }
  const totalRevenue = salesTotals?.totalSales ?? 0;
  const totalBills = salesTotals?.totalBills ?? 0;
  const totalDiscount = salesTotals?.totalDiscount ?? 0;
  const totalPieces = salesTotals?.totalPieces ?? 0;

  // dashSummary: { totalVendors, totalItems, totalStock, totalPurchases, totalPurchaseAmount }
  const totalItems = dashSummary?.totalItems ?? 0;
  const totalPurchases = dashSummary?.totalPurchases ?? 0;

  // Use data from profitLossData API if available, otherwise fallback to computed values
  const totalCOGS =
    profitLossData?.grossProfit !== undefined
      ? profitLossData.totalSales - profitLossData.grossProfit
      : (dashSummary?.totalPurchaseAmount ?? 0);
  const totalExpenses =
    profitLossData?.totalExpenses ??
    expenses.reduce((s, e) => s + (e.amount ?? 0), 0);

  const grossProfit = profitLossData?.grossProfit ?? totalRevenue - totalCOGS;
  const netProfit = profitLossData?.netProfit ?? grossProfit - totalExpenses;
  const grossMargin = totalRevenue ? (grossProfit / totalRevenue) * 100 : 0;
  const netMargin = totalRevenue ? (netProfit / totalRevenue) * 100 : 0;
  const avgOrderValue = totalBills ? totalRevenue / totalBills : 0;

  // ── derived chart data ────────────────────────────────────────────────────
  const trendData = purchaseTrend.map((d) => ({
    date: d.date?.slice(5) ?? d.date,
    Purchases: d.total ?? 0,
  }));

  const expensePieData = Object.entries(
    expenses.reduce((acc, e) => {
      const k = e?.category_name;
      acc[k] = (acc[k] ?? 0) + (e.amount ?? 0);
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));
  const paymentPieData = paymentModes.map((p) => ({
    name: p.payment_mode ?? "Unknown",
    value: p.count ?? 0,
  }));

  const sizePerf = Object.entries(
    variantStock.reduce((acc, v) => {
      acc[v.size] = (acc[v.size] ?? 0) + (v.quantity ?? 0);
      return acc;
    }, {}),
  )
    .map(([size, qty]) => ({ size, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10);

  // ── print ─────────────────────────────────────────────────────────────────
  const handlePrint = () => {
    const style = `<style>
      *{box-sizing:border-box}body{font-family:sans-serif;background:white;margin:0;padding:24px;color:#0f172a}
      h1{font-size:22px;font-weight:800;margin:0 0 4px}.sub{color:#64748b;font-size:12px;margin-bottom:20px}
      .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px}
      .card{border:1px solid #e2e8f0;border-radius:10px;padding:12px 16px}
      .lbl{font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase}.val{font-size:20px;font-weight:800;margin:4px 0 0}
      table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:20px}
      th{background:#f8fafc;padding:8px 12px;text-align:left;font-weight:700;font-size:11px;color:#64748b;text-transform:uppercase}
      td{padding:8px 12px;border-bottom:1px solid #f1f5f9}
      .sec{font-size:15px;font-weight:800;margin:20px 0 10px;color:#1e293b}
      @media print{@page{margin:12mm}}
    </style>`;

    const kpi = `<div class="grid">${[
      ["Revenue", fmt(totalRevenue)],
      ["COGS", fmt(totalCOGS)],
      ["Gross Profit", fmt(grossProfit)],
      ["Net Profit", fmt(netProfit)],
      ["Expenses", fmt(totalExpenses)],
      ["Discounts", fmt(totalDiscount)],
      ["Bills", totalBills],
      ["Pieces Sold", totalPieces],
    ]
      .map(
        ([l, v]) =>
          `<div class="card"><div class="lbl">${l}</div><div class="val">${v}</div></div>`,
      )
      .join("")}</div>`;

    const pl = `<div class="sec">P&L Statement</div><table>
      <tr><th>Item</th><th>Amount</th><th>% Revenue</th></tr>
      <tr><td><b>Total Revenue</b></td><td>${fmt(totalRevenue)}</td><td>100%</td></tr>
      <tr><td>COGS</td><td>−${fmt(totalCOGS)}</td><td>${pct(totalCOGS, totalRevenue)}</td></tr>
      <tr><td><b>Gross Profit</b></td><td>${fmt(grossProfit)}</td><td>${grossMargin.toFixed(1)}%</td></tr>
      <tr><td>Discounts</td><td>−${fmt(totalDiscount)}</td><td>${pct(totalDiscount, totalRevenue)}</td></tr>
      <tr><td>Expenses</td><td>−${fmt(totalExpenses)}</td><td>${pct(totalExpenses, totalRevenue)}</td></tr>
      <tr><td><b>Net Profit</b></td><td>${fmt(netProfit)}</td><td>${netMargin.toFixed(1)}%</td></tr>
    </table>`;

    const vendors = topVendors.length
      ? `<div class="sec">Top Vendors</div><table>
      <tr><th>#</th><th>Vendor</th><th>Orders</th><th>Total</th></tr>
      ${topVendors.map((v, i) => `<tr><td>${i + 1}</td><td>${v.vendorName}</td><td>${v.purchaseCount}</td><td>${fmt(v.total)}</td></tr>`).join("")}
    </table>`
      : "";

    const items = topSellingItems.length
      ? `<div class="sec">Top Selling Items</div><table>
      <tr><th>#</th><th>Item</th><th>Code</th><th>Qty Sold</th></tr>
      ${topSellingItems.map((t, i) => `<tr><td>${i + 1}</td><td>${t.item_name}</td><td>${t.item_code ?? ""}</td><td>${t.totalSold}</td></tr>`).join("")}
    </table>`
      : "";

    const exp = expenses.length
      ? `<div class="sec">Expense Details</div><table>
      <tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th></tr>
      ${expenses
        .slice(0, 30)
        .map(
          (e) =>
            `<tr><td>${e.expense_date ?? ""}</td><td>${e.category_name ?? ""}</td><td>${e.description ?? ""}</td><td>${fmt(e.amount)}</td></tr>`,
        )
        .join("")}
      <tr><td colspan="3"><b>Total</b></td><td><b>${fmt(totalExpenses)}</b></td></tr>
    </table>`
      : "";

    const footer = `<p style="color:#94a3b8;font-size:11px;text-align:center;margin-top:24px">Generated ${new Date().toLocaleString("en-IN")} · ${startDate} to ${endDate}</p>`;

    const win = window.open("", "_blank", "width=1000,height=700");
    win.document
      .write(`<!DOCTYPE html><html><head><title>P&L Report</title>${style}</head><body>
      <h1>Profit & Loss Report</h1>
      <p class="sub">${startDate} to ${endDate}</p>
      ${kpi}${pl}${vendors}${items}${exp}${footer}
    </body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 600);
  };

  const applyPreset = (p) => {
    setActivePreset(p.label);
    setStartDate(p.start);
    setEndDate(p.end);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        .report-root{background:#f8fafc;min-height:100vh;padding:28px 32px;font-family:'DM Sans',system-ui,sans-serif}
        .report-root *{box-sizing:border-box}
        .btn-primary{background:#6366f1;color:white;border:none;border-radius:10px;padding:9px 18px;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:6px;transition:background .15s}
        .btn-primary:hover{background:#4f46e5}
        .btn-outline{background:white;color:#374151;border:1px solid #e2e8f0;border-radius:10px;padding:9px 16px;font-size:13px;font-weight:600;cursor:pointer}
        .btn-outline:hover{border-color:#6366f1;color:#6366f1}
        .btn-preset{background:white;color:#64748b;border:1px solid #e2e8f0;border-radius:8px;padding:6px 14px;font-size:12px;font-weight:600;cursor:pointer;transition:all .15s}
        .btn-preset.active{background:#6366f1;color:white;border-color:#6366f1}
        .grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
        .grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
        .grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
        @media(max-width:1100px){.grid-4{grid-template-columns:repeat(2,1fr)}.grid-3{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:700px){.grid-4,.grid-2,.grid-3{grid-template-columns:1fr}.report-root{padding:16px}}
        .chart-card{background:white;border-radius:16px;padding:20px 22px;border:1px solid #f1f5f9;box-shadow:0 1px 4px rgba(0,0,0,.06)}
        .pl-table{width:100%;border-collapse:collapse}
        .pl-table td,.pl-table th{padding:9px 14px;font-size:13px}
        .pl-table th{background:#f8fafc;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em}
        .pl-table tr:not(:last-child) td{border-bottom:1px solid #f1f5f9}
        .pl-table .total-row td{font-weight:800;font-size:14px;border-top:2px solid #e2e8f0;background:#f8fafc}
        .tag{display:inline-block;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:700}
        .tag-green{background:#d1fae5;color:#065f46}.tag-red{background:#fee2e2;color:#991b1b}.tag-blue{background:#dbeafe;color:#1e40af}
        input[type="date"]{border:1px solid #e2e8f0;border-radius:8px;padding:7px 10px;font-size:13px;color:#374151;background:white;outline:none;cursor:pointer}
        input[type="date"]:focus{border-color:#6366f1}
        .skeleton{background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);background-size:200%;animation:shimmer 1.2s infinite;border-radius:8px}
        @keyframes shimmer{from{background-position:200%}to{background-position:-200%}}
      `}</style>

      <div className="report-root">
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 800,
                color: "#0f172a",
              }}
            >
              Profit & Loss Report
            </h1>
            <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: 13 }}>
              {startDate} → {endDate} · Generated{" "}
              {new Date().toLocaleDateString("en-IN")}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn-outline" onClick={loadData}>
              🔄 Refresh
            </button>
            <button className="btn-primary" onClick={handlePrint}>
              🖨️ Print / PDF
            </button>
          </div>
        </div>

        {/* Date Filter */}
        <div
          style={{
            background: "white",
            borderRadius: 14,
            padding: "16px 20px",
            border: "1px solid #f1f5f9",
            marginBottom: 24,
            display: "flex",
            gap: 16,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>
            Date Range
          </span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {PRESETS.map((p) => (
              <button
                key={p.label}
                className={`btn-preset ${activePreset === p.label ? "active" : ""}`}
                onClick={() => applyPreset(p)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              marginLeft: "auto",
            }}
          >
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setActivePreset("Custom");
              }}
            />
            <span style={{ color: "#94a3b8", fontSize: 13 }}>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setActivePreset("Custom");
              }}
            />
          </div>
        </div>

        {error && (
          <div
            style={{
              background: "#fee2e2",
              border: "1px solid #fca5a5",
              borderRadius: 10,
              padding: "12px 16px",
              marginBottom: 20,
              color: "#991b1b",
              fontSize: 13,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <div ref={printRef}>
          {/* KPI Cards */}
          {loading ? (
            <div className="grid-4" style={{ marginBottom: 24 }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 110 }} />
              ))}
            </div>
          ) : (
            <>
              <div className="grid-4" style={{ marginBottom: 16 }}>
                <StatCard
                  label="Total Revenue"
                  value={fmtShort(totalRevenue)}
                  sub={`${totalBills} bills · ${totalPieces} pcs`}
                  color="#6366f1"
                  icon="💰"
                />
                <StatCard
                  label="Total COGS"
                  value={fmtShort(totalCOGS)}
                  sub={`${totalPurchases} purchase orders`}
                  color="#f59e0b"
                  icon="📦"
                />
                <StatCard
                  label="Gross Profit"
                  value={fmtShort(grossProfit)}
                  sub={`Margin: ${grossMargin.toFixed(1)}%`}
                  color={grossProfit >= 0 ? "#10b981" : "#f43f5e"}
                  icon="📈"
                />
                <StatCard
                  label="Total Expenses"
                  value={fmtShort(totalExpenses)}
                  sub={`${expenses.length} entries`}
                  color="#f43f5e"
                  icon="💸"
                />
              </div>
              <div className="grid-4" style={{ marginBottom: 24 }}>
                <StatCard
                  label="Net Profit"
                  value={fmtShort(netProfit.toFixed(2))}
                  sub={`Net margin: ${netMargin.toFixed(1)}%`}
                  color={netProfit >= 0 ? "#10b981" : "#f43f5e"}
                  icon={netProfit >= 0 ? "🟢" : "🔴"}
                />
                <StatCard
                  label="Avg Order Value"
                  value={fmtShort(avgOrderValue.toFixed(2))}
                  sub="Per bill"
                  color="#22d3ee"
                  icon="🧾"
                />
                <StatCard
                  label="Total Discount"
                  value={fmtShort(totalDiscount.toFixed(2))}
                  sub="Discounts given"
                  color="#a78bfa"
                  icon="🏷️"
                />
                <StatCard
                  label="Total Items (filter will not applied for this)"
                  value={totalItems}
                  sub="In catalogue"
                  color="#fb923c"
                  icon="📋"
                />
              </div>
            </>
          )}

          {/* P&L Statement */}
          <div className="chart-card" style={{ marginBottom: 24 }}>
            <SectionHeader
              title="Profit & Loss Statement"
              sub="Summary financial overview for selected period"
            />
            <table className="pl-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                  <th style={{ textAlign: "right" }}>% of Revenue</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>💰 Total Revenue</td>
                  <td style={{ textAlign: "right", fontWeight: 700 }}>
                    {fmt(totalRevenue)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <span className="tag tag-blue">100%</span>
                  </td>
                </tr>
                <tr>
                  <td style={{ color: "#64748b", paddingLeft: 28 }}>
                    Cost of Goods Sold (COGS)
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      color: "#f59e0b",
                      fontWeight: 600,
                    }}
                  >
                    − {fmt(totalCOGS)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {pct(totalCOGS, totalRevenue)}
                  </td>
                </tr>
                <tr className="total-row">
                  <td>📊 Gross Profit</td>
                  <td
                    style={{
                      textAlign: "right",
                      color: grossProfit >= 0 ? "#10b981" : "#f43f5e",
                    }}
                  >
                    {fmt(grossProfit)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <span
                      className={`tag ${grossProfit >= 0 ? "tag-green" : "tag-red"}`}
                    >
                      {grossMargin.toFixed(1)}%
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style={{ color: "#64748b", paddingLeft: 28 }}>
                    Discounts Given
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      color: "#a78bfa",
                      fontWeight: 600,
                    }}
                  >
                    − {fmt(totalDiscount)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {pct(totalDiscount, totalRevenue)}
                  </td>
                </tr>
                <tr>
                  <td style={{ color: "#64748b", paddingLeft: 28 }}>
                    Operating Expenses
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      color: "#f43f5e",
                      fontWeight: 600,
                    }}
                  >
                    − {fmt(totalExpenses)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {pct(totalExpenses, totalRevenue)}
                  </td>
                </tr>
                <tr className="total-row">
                  <td style={{ fontSize: 15 }}>🏆 Net Profit</td>
                  <td
                    style={{
                      textAlign: "right",
                      fontSize: 15,
                      color: netProfit >= 0 ? "#10b981" : "#f43f5e",
                    }}
                  >
                    {fmt(netProfit)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <span
                      className={`tag ${netProfit >= 0 ? "tag-green" : "tag-red"}`}
                    >
                      {netMargin.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Charts Row 1 */}
          <div className="grid-2" style={{ marginBottom: 24 }}>
            <div className="chart-card">
              <SectionHeader
                title="Purchase Trend"
                sub="Daily purchase amounts"
              />
              {loading ? (
                <div className="skeleton" style={{ height: 220 }} />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart
                    data={trendData}
                    margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="purpGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="#6366f1"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="100%"
                          stopColor="#6366f1"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      tickFormatter={fmtShort}
                    />
                    <Tooltip content={<ChartTip />} />
                    <Area
                      type="monotone"
                      dataKey="Purchases"
                      stroke="#6366f1"
                      fill="url(#purpGrad)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="chart-card">
              <SectionHeader
                title="Monthly Purchase Summary"
                sub="Amount & order count by month"
              />
              {loading ? (
                <div className="skeleton" style={{ height: 220 }} />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={monthlyPurchases}
                    margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      tickFormatter={fmtShort}
                    />
                    <Tooltip content={<ChartTip />} />
                    <Bar
                      dataKey="totalAmount"
                      name="Amount"
                      fill="#6366f1"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="purchaseCount"
                      name="Orders"
                      fill="#22d3ee"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid-3" style={{ marginBottom: 24 }}>
            {/* Expense pie */}
            <div className="chart-card">
              <SectionHeader title="Expense Breakdown" sub="By category" />
              {loading ? (
                <div className="skeleton" style={{ height: 200 }} />
              ) : expensePieData.length ? (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={expensePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {expensePieData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => fmtShort(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "4px 12px",
                      marginTop: 8,
                    }}
                  >
                    {expensePieData.map((e, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: 11,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: COLORS[i % COLORS.length],
                            display: "inline-block",
                          }}
                        />
                        {e.name}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div
                  style={{
                    color: "#94a3b8",
                    fontSize: 13,
                    paddingTop: 40,
                    textAlign: "center",
                  }}
                >
                  No expense data
                </div>
              )}
            </div>

            {/* Payment mode pie */}
            <div className="chart-card">
              <SectionHeader
                title="Payment Modes"
                sub="Bills by payment method"
              />
              {loading ? (
                <div className="skeleton" style={{ height: 200 }} />
              ) : paymentPieData.length ? (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={paymentPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {paymentPieData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "4px 12px",
                      marginTop: 8,
                    }}
                  >
                    {paymentPieData.map((p, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: 11,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: COLORS[i % COLORS.length],
                            display: "inline-block",
                          }}
                        />
                        {p.name} ({p.value})
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div
                  style={{
                    color: "#94a3b8",
                    fontSize: 13,
                    paddingTop: 40,
                    textAlign: "center",
                  }}
                >
                  No payment data
                </div>
              )}
            </div>

            {/* Size performance */}
            <div className="chart-card">
              <SectionHeader
                title="Size Performance"
                sub="Stock quantity by size"
              />
              {loading ? (
                <div className="skeleton" style={{ height: 200 }} />
              ) : sizePerf.length ? (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {sizePerf.map((s, i) => (
                    <div key={s.size}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 12,
                          marginBottom: 3,
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>{s.size}</span>
                        <span style={{ color: "#64748b" }}>{s.qty} pcs</span>
                      </div>
                      <div
                        style={{
                          background: "#f1f5f9",
                          borderRadius: 99,
                          height: 7,
                        }}
                      >
                        <div
                          style={{
                            height: 7,
                            borderRadius: 99,
                            width: `${(s.qty / sizePerf[0].qty) * 100}%`,
                            background: COLORS[i % COLORS.length],
                            transition: "width .4s ease",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    color: "#94a3b8",
                    fontSize: 13,
                    paddingTop: 40,
                    textAlign: "center",
                  }}
                >
                  No variant data
                </div>
              )}
            </div>
          </div>

          {/* P&L Overview bar */}
          <div className="chart-card" style={{ marginBottom: 24 }}>
            <SectionHeader
              title="P&L Overview"
              sub="Revenue vs Cost vs Profit at a glance"
            />
            {loading ? (
              <div className="skeleton" style={{ height: 200 }} />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={[
                    { name: "Revenue", value: totalRevenue },
                    { name: "COGS", value: totalCOGS },
                    { name: "Discounts", value: totalDiscount },
                    { name: "Expenses", value: totalExpenses },
                    { name: "Net Profit", value: netProfit },
                  ]}
                  margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    tickFormatter={fmtShort}
                  />
                  <Tooltip content={<ChartTip />} />
                  <Bar dataKey="value" name="Amount" radius={[6, 6, 0, 0]}>
                    {[
                      "#6366f1",
                      "#f59e0b",
                      "#a78bfa",
                      "#f43f5e",
                      netProfit >= 0 ? "#10b981" : "#ef4444",
                    ].map((fill, i) => (
                      <Cell key={i} fill={fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top Vendors */}
          <div className="chart-card" style={{ marginBottom: 24 }}>
            <SectionHeader
              title="Top Vendor Performance"
              sub="Ranked by total purchase amount"
            />
            {loading ? (
              <div className="skeleton" style={{ height: 180 }} />
            ) : topVendors.length ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 24,
                }}
              >
                <table className="pl-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Vendor</th>
                      <th style={{ textAlign: "right" }}>Orders</th>
                      <th style={{ textAlign: "right" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topVendors.map((v, i) => (
                      <tr key={i}>
                        <td style={{ color: "#94a3b8", width: 28 }}>{i + 1}</td>
                        <td style={{ fontWeight: 600 }}>{v.vendorName}</td>
                        <td style={{ textAlign: "right" }}>
                          {v.purchaseCount}
                        </td>
                        <td style={{ textAlign: "right", fontWeight: 700 }}>
                          {fmtShort(v.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <ResponsiveContainer
                  width="100%"
                  height={Math.max(topVendors.length * 36, 160)}
                >
                  <BarChart
                    data={topVendors}
                    layout="vertical"
                    margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                  >
                    <XAxis
                      type="number"
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      tickFormatter={fmtShort}
                    />
                    <YAxis
                      dataKey="vendorName"
                      type="category"
                      tick={{ fontSize: 10, fill: "#374151" }}
                      width={90}
                    />
                    <Tooltip content={<ChartTip />} />
                    <Bar
                      dataKey="total"
                      name="Total"
                      fill="#6366f1"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div
                style={{
                  color: "#94a3b8",
                  fontSize: 13,
                  textAlign: "center",
                  padding: "24px 0",
                }}
              >
                No vendor data for this period
              </div>
            )}
          </div>

          {/* Top Selling Items */}
          {topSellingItems.length > 0 && (
            <div className="chart-card" style={{ marginBottom: 24 }}>
              <SectionHeader
                title="Top Selling Items"
                sub="By quantity sold in billing"
              />
              <table className="pl-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Item</th>
                    <th>Code</th>
                    <th style={{ textAlign: "right" }}>Qty Sold</th>
                  </tr>
                </thead>
                <tbody>
                  {topSellingItems.map((t, i) => (
                    <tr key={i}>
                      <td style={{ color: "#94a3b8", width: 28 }}>{i + 1}</td>
                      <td style={{ fontWeight: 600 }}>{t.item_name}</td>
                      <td style={{ color: "#64748b" }}>{t.item_code ?? "–"}</td>
                      <td style={{ textAlign: "right", fontWeight: 700 }}>
                        {t.totalSold}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Expense Details */}
          <div className="chart-card" style={{ marginBottom: 24 }}>
            <SectionHeader
              title="Expense Details"
              sub="All expenses in selected period"
            />
            {loading ? (
              <div className="skeleton" style={{ height: 140 }} />
            ) : expenses.length ? (
              <div style={{ overflowX: "auto" }}>
                <table className="pl-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th style={{ textAlign: "right" }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.slice(0, 20).map((e, i) => (
                      <tr key={i}>
                        <td style={{ color: "#64748b", fontSize: 12 }}>
                          {e.expense_date ?? e.date}
                        </td>
                        <td>
                          <span className="tag tag-blue">
                            {e.category_name ?? e.category ?? "–"}
                          </span>
                        </td>
                        <td style={{ color: "#64748b" }}>
                          {e.description ?? "–"}
                        </td>
                        <td
                          style={{
                            textAlign: "right",
                            fontWeight: 700,
                            color: "#f43f5e",
                          }}
                        >
                          {fmt(e.amount)}
                        </td>
                      </tr>
                    ))}
                    <tr className="total-row">
                      <td colSpan={3} style={{ fontWeight: 800 }}>
                        Total Expenses
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          fontWeight: 800,
                          color: "#f43f5e",
                        }}
                      >
                        {fmt(totalExpenses)}
                      </td>
                    </tr>
                  </tbody>
                </table>
                {expenses.length > 20 && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "#94a3b8",
                      textAlign: "center",
                      marginTop: 8,
                    }}
                  >
                    Showing 20 of {expenses.length} entries
                  </p>
                )}
              </div>
            ) : (
              <div
                style={{
                  color: "#94a3b8",
                  fontSize: 13,
                  textAlign: "center",
                  padding: "24px 0",
                }}
              >
                No expenses for this period
              </div>
            )}
          </div>

          <div
            style={{
              textAlign: "center",
              color: "#cbd5e1",
              fontSize: 11,
              paddingTop: 12,
            }}
          >
            Generated on {new Date().toLocaleString("en-IN")} · {startDate} to{" "}
            {endDate}
          </div>
        </div>
      </div>
    </>
  );
};

export default Report;
