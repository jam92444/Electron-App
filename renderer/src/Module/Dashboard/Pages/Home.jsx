/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
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
import {
  FaShoppingCart,
  FaRupeeSign,
  FaTags,
  FaBoxes,
  FaTruck,
} from "react-icons/fa";

import { getSalesDashboard } from "../../Billing/Services/bills";

import {
  getDashboardSummary,
  getPurchaseTrend,
  getTopVendors,
  getRecentPurchases,
  getLowStockItems,
  getVariantStockSummary,
  getMonthlyPurchaseSummary,
  getVendorStatusStats,
} from "../../Purchase/Services/purchaseService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
);

const Home = () => {
  const [loading, setLoading] = useState(true);

  // Sales Data
  const [salesDashboard, setSalesDashboard] = useState(null);

  // Purchase Data
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

      try {
        const [
          salesRes,
          summaryRes,
          trendRes,
          topVendorRes,
          recentPurchasesRes,
          lowStockRes,
          variantStockRes,
          monthlyRes,
          vendorStatusRes,
        ] = await Promise.all([
          getSalesDashboard("2026-02-01", "2026-02-05"),
          getDashboardSummary(),
          getPurchaseTrend(30),
          getTopVendors(),
          getRecentPurchases(),
          getLowStockItems(),
          getVariantStockSummary(),
          getMonthlyPurchaseSummary(),
          getVendorStatusStats(),
        ]);

        if (salesRes?.success) setSalesDashboard(salesRes);
        if (summaryRes?.success) setSummary(summaryRes.data);
        if (trendRes?.success) setPurchaseTrend(trendRes.data);
        if (topVendorRes?.success) setTopVendors(topVendorRes.data);
        if (recentPurchasesRes?.success)
          setRecentPurchases(recentPurchasesRes.data);
        if (lowStockRes?.success) setLowStock(lowStockRes.data);
        if (variantStockRes?.success) setVariantStock(variantStockRes.data);
        if (monthlyRes?.success) setMonthlySummary(monthlyRes.data);
        if (vendorStatusRes?.success) setVendorStatus(vendorStatusRes.data);
        // console.log(lowStockRes);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      }

      setLoading(false);
    };

    loadDashboard();
  }, []);

  if (loading) return <p className="p-6 text-gray-500">Loading dashboard...</p>;

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

  const monthlySalesData = {
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
      {/* ---------------- HEADER ---------------- */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Home Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Overview of Sales, Purchases, Stock & Vendors
        </p>
      </div>

      {/* ---------------- KPI CARDS ---------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <KpiCard
          icon={<FaShoppingCart />}
          label="Total Bills"
          value={salesDashboard?.totals?.totalBills || 0}
          color="bg-blue-500"
        />
        <KpiCard
          icon={<FaRupeeSign />}
          label="Total Sales"
          value={`₹${salesDashboard?.totals?.totalSales || 0}`}
          color="bg-green-500"
        />
        <KpiCard
          icon={<FaTags />}
          label="Total Discount"
          value={`₹${salesDashboard?.totals?.totalDiscount || 0}`}
          color="bg-yellow-500"
        />
        <KpiCard
          icon={<FaBoxes />}
          label="Total Pieces Sold"
          value={salesDashboard?.totals?.totalPieces || 0}
          color="bg-purple-500"
        />
        <KpiCard
          icon={<FaTruck />}
          label="Total Purchases"
          value={`₹${summary.totalPurchaseAmount || 0}`}
          color="bg-pink-500"
        />
      </div>

      {/* ---------------- CHARTS ---------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSection title="Purchase Trend (30 Days)">
          <Line
            data={purchaseTrendData}
            options={{ plugins: { legend: { display: false } } }}
          />
        </ChartSection>

        <ChartSection title="Monthly Purchase Summary">
          <Bar
            data={monthlySalesData}
            options={{ plugins: { legend: { display: false } } }}
          />
        </ChartSection>
      </div>

      {/* ---------------- TOP SELLERS & VENDORS ---------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ListSection title="Top Selling Items">
          {salesDashboard?.topItems?.map((item) => (
            <Row
              key={item.item_code}
              left={item.item_name}
              right={item.totalSold}
            />
          ))}
        </ListSection>

        <ListSection title="Top Vendors">
          {topVendors.map((v, i) => (
            <Row key={i} left={v.vendorName} right={`₹ ${v.total}`} />
          ))}
        </ListSection>
      </div>

      {/* ---------------- STOCK ALERTS ---------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ListSection title="Low Stock Items">
          {lowStock.length ? (
            lowStock.map((i, idx) => (
              <Row
                key={idx}
                left={`${i.itemName} (${i.vendorName || "—"})`}
                right={
                  <span className="text-red-500 font-bold">{i.quantity}</span>
                }
              />
            ))
          ) : (
            <Empty />
          )}
        </ListSection>

        <ListSection title="Latest Variant">
          {variantStock.length ? (
            variantStock.map((v, idx) => (
              <Row
                key={idx}
                left={`${v.itemName} - ${v.size}`}
                right={`Qty: ${v.quantity}`}
              />
            ))
          ) : (
            <Empty />
          )}
        </ListSection>
      </div>

      {/* ---------------- PAYMENT MODES ---------------- */}
      <ListSection title="Payment Modes">
        {salesDashboard?.paymentModes?.map((pm) => (
          <span
            key={pm.payment_mode}
            className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mr-2 mb-2 inline-block"
          >
            {pm.payment_mode || "Cash"}: {pm.count} bills
          </span>
        ))}
      </ListSection>

      {/* ---------------- RECENT PURCHASES ---------------- */}
      <ListSection title="Recent Purchases">
        {recentPurchases.map((p) => (
          <Row key={p.id} left={p.vendorName} right={`₹ ${p.totalAmount}`} />
        ))}
      </ListSection>
    </div>
  );
};

/* ---------------- COMPONENTS ---------------- */
const KpiCard = ({ icon, label, value, color }) => (
  <div
    className={`flex items-center gap-4 p-4 rounded-xl text-white ${color} shadow-lg`}
  >
    <div className="text-3xl">{icon}</div>
    <div>
      <p className="text-sm">{label}</p>
      <h2 className="text-xl font-bold">{value}</h2>
    </div>
  </div>
);

const ChartSection = ({ title, children }) => (
  <div className="bg-white rounded-xl p-5 shadow-md">
    <h3 className="font-semibold mb-4">{title}</h3>
    {children}
  </div>
);

const ListSection = ({ title, children }) => (
  <div className="bg-white rounded-xl p-5 shadow-md">
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

export default Home;
