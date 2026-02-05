import { useEffect, useState } from "react";
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
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
);

const PurchaseDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState({});
  const [purchaseTrend, setPurchaseTrend] = useState([]);
  const [topVendors, setTopVendors] = useState([]);
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [variantStock, setVariantStock] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [vendorStatus, setVendorStatus] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);

      const [
        summaryRes,
        trendRes,
        topVendorRes,
        recentRes,
        lowStockRes,
        variantStockRes,
        monthlyRes,
        vendorStatusRes,
      ] = await Promise.all([
        getDashboardSummary(),
        getPurchaseTrend(30),
        getTopVendors(),
        getRecentPurchases(),
        getLowStockItems(),
        getVariantStockSummary(),
        getMonthlyPurchaseSummary(),
        getVendorStatusStats(),
      ]);

      if (summaryRes?.success) setSummary(summaryRes.data);
      if (trendRes?.success) setPurchaseTrend(trendRes.data);
      if (topVendorRes?.success) setTopVendors(topVendorRes.data);
      if (recentRes?.success) setRecentPurchases(recentRes.data);
      if (lowStockRes?.success) setLowStock(lowStockRes.data);
      if (variantStockRes?.success) setVariantStock(variantStockRes.data);
      if (monthlyRes?.success) setMonthlySummary(monthlyRes.data);
      if (vendorStatusRes?.success) setVendorStatus(vendorStatusRes.data);

      setLoading(false);
    };

    loadDashboard();
  }, []);

  // Prepare chart data
  const purchaseTrendData = {
    labels: purchaseTrend.map((p) => p.date),
    datasets: [
      {
        label: "Purchase Amount",
        data: purchaseTrend.map((p) => p.total),
        borderColor: "#3b82f6",
        backgroundColor: "#3b82f6aa",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const monthlySummaryData = {
    labels: monthlySummary.map((m) => m.month),
    datasets: [
      {
        label: "Total Amount",
        data: monthlySummary.map((m) => m.totalAmount),
        backgroundColor: "#10b981aa",
      },
    ],
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 text-lg animate-pulse">
            Loading dashboard...
          </p>
        </div>
      ) : (
        <>
          {/* HEADER */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Purchase Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Complete purchase & vendor overview
              </p>
            </div>
            <Button
              buttonName="+ New Purchase"
              onClick={() => navigate("/purchase/new")}
            />
          </div>

          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <SummaryCard
              title="Purchases"
              value={summary.totalPurchases}
              icon="🛒"
              color="from-blue-400 to-blue-600"
            />
            <SummaryCard
              title="Total Amount"
              value={`₹ ${Number(summary.totalPurchaseAmount || 0).toLocaleString()}`}
              icon="💰"
              color="from-green-400 to-green-600"
            />
            <SummaryCard
              title="Vendors"
              value={summary.totalVendors}
              icon="🏢"
              color="from-purple-400 to-purple-600"
            />
            <SummaryCard
              title="Items"
              value={summary.totalItems}
              icon="📦"
              color="from-yellow-400 to-yellow-500"
            />
          </div>

          {/* CHARTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartSection title="Purchase Trend (30 Days)">
              <Line
                data={purchaseTrendData}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                }}
              />
            </ChartSection>

            <ChartSection title="Monthly Summary">
              <Bar
                data={monthlySummaryData}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                }}
              />
            </ChartSection>
          </div>

          {/* TOP VENDORS + VENDOR STATUS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ListSection title="Top Vendors">
              {topVendors.map((v, i) => (
                <Row key={i} left={v.vendorName} right={`₹ ${v.total}`} />
              ))}
            </ListSection>

            <ListSection title="Vendor Status">
              {vendorStatus.map((s, i) => (
                <Row key={i} left={s.status} right={s.count} />
              ))}
            </ListSection>
          </div>

          {/* STOCK ALERTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ListSection title="Low Stock Items">
              {lowStock.length === 0 ? (
                <Empty />
              ) : (
                lowStock.map((i, idx) => (
                  <Row
                    key={idx}
                    left={`${i.itemName} (${i.vendorName || "—"})`}
                    right={
                      <span className="text-red-500 font-bold">
                        Qty: {i.quantity}
                      </span>
                    }
                  />
                ))
              )}
            </ListSection>

            <ListSection title="Variant Stock">
              {variantStock.slice(0, 8).map((v, idx) => (
                <Row
                  key={idx}
                  left={`${v.itemName} - ${v.size}`}
                  right={`Qty: ${v.quantity}`}
                />
              ))}
            </ListSection>
          </div>

          {/* RECENT PURCHASES */}
          <ListSection title="Recent Purchases">
            {recentPurchases.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/purchase/${p.id}`)}
                className="flex justify-between py-2 px-3 rounded hover:bg-blue-50 cursor-pointer transition"
              >
                <span>{p.vendorName}</span>
                <span className="font-semibold">₹ {p.totalAmount}</span>
              </div>
            ))}
          </ListSection>

          {/* FULL TABLE */}
          <PurchasesListTable
            onView={(row) => navigate(`/purchase/${row.id}`)}
          />
        </>
      )}
    </div>
  );
};

/* ----------------- COMPONENTS ----------------- */

const SummaryCard = ({ title, value, icon, color }) => (
  <div
    className={`bg-gradient-to-r ${color} text-white p-5 rounded-2xl shadow-lg flex items-center space-x-4`}
  >
    <div className="text-3xl">{icon}</div>
    <div>
      <p className="text-sm">{title}</p>
      <h2 className="text-2xl font-bold">{value ?? 0}</h2>
    </div>
  </div>
);

const ChartSection = ({ title, children }) => (
  <div className="bg-white rounded-2xl p-5 shadow-md">
    <h3 className="font-semibold mb-4">{title}</h3>
    {children}
  </div>
);

const ListSection = ({ title, children }) => (
  <div className="bg-white rounded-2xl p-5 shadow-md">
    <h3 className="font-semibold mb-3">{title}</h3>
    <div className="space-y-2 text-sm">{children}</div>
  </div>
);

const Row = ({ left, right }) => (
  <div className="flex justify-between py-1">
    <span className="text-gray-700">{left}</span>
    <span className="font-medium">{right}</span>
  </div>
);

const Empty = () => <p className="text-gray-400 text-sm">No data available</p>;

export default PurchaseDashboard;
