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
import { useStateContext } from "../../../context/StateContext";

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
  const { state } = useStateContext();

  // ── Permissions ──
  const perms = state.user.permissions;
  const has = (p) => perms.includes(p) || perms.includes("*.*");

  const canViewBills = has("bill.view");
  const canViewPurchase = has("purchase.view");
  const canViewVendor = has("vendor.view");
  const canViewItems = has("items.view");

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
        const tasks = [];

        if (canViewBills)
          tasks.push(
            getSalesDashboard("2026-02-01", "2026-02-05").then((r) => ({
              key: "sales",
              r,
            })),
          );
        if (canViewPurchase)
          tasks.push(
            getDashboardSummary().then((r) => ({ key: "summary", r })),
          );
        if (canViewPurchase)
          tasks.push(getPurchaseTrend(30).then((r) => ({ key: "trend", r })));
        if (canViewVendor)
          tasks.push(getTopVendors().then((r) => ({ key: "topVendors", r })));
        if (canViewPurchase)
          tasks.push(
            getRecentPurchases().then((r) => ({ key: "recentPurchases", r })),
          );
        if (canViewItems)
          tasks.push(getLowStockItems().then((r) => ({ key: "lowStock", r })));
        if (canViewItems)
          tasks.push(
            getVariantStockSummary().then((r) => ({ key: "variantStock", r })),
          );
        if (canViewPurchase)
          tasks.push(
            getMonthlyPurchaseSummary().then((r) => ({ key: "monthly", r })),
          );
        if (canViewVendor)
          tasks.push(
            getVendorStatusStats().then((r) => ({ key: "vendorStatus", r })),
          );

        const results = await Promise.allSettled(tasks);

        results.forEach((result) => {
          if (result.status !== "fulfilled") return;
          const { key, r } = result.value;
          if (!r?.success) return;
          if (key === "sales") setSalesDashboard(r);
          if (key === "summary") setSummary(r.data);
          if (key === "trend") setPurchaseTrend(r.data);
          if (key === "topVendors") setTopVendors(r.data);
          if (key === "recentPurchases") setRecentPurchases(r.data);
          if (key === "lowStock") setLowStock(r.data);
          if (key === "variantStock") setVariantStock(r.data);
          if (key === "monthly") setMonthlySummary(r.data);
          if (key === "vendorStatus") setVendorStatus(r.data);
        });
      } catch (err) {
        console.error("Error loading dashboard:", err);
      }
      setLoading(false);
    };

    loadDashboard();
  }, []);

  if (loading) return <p className="p-6 text-gray-500">Loading dashboard...</p>;

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
        {canViewBills && (
          <>
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
          </>
        )}
        {canViewPurchase && (
          <KpiCard
            icon={<FaTruck />}
            label="Total Purchases"
            value={`₹${summary.totalPurchaseAmount || 0}`}
            color="bg-pink-500"
          />
        )}
      </div>

      {/* ---------------- CHARTS (purchase.view) ---------------- */}
      {canViewPurchase && (
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
      )}

      {/* ---------------- TOP SELLERS & VENDORS ---------------- */}
      {(canViewBills || canViewVendor) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {canViewBills && (
            <ListSection title="Top Selling Items">
              {salesDashboard?.topItems?.length ? (
                salesDashboard.topItems.map((item) => (
                  <Row
                    key={item.item_code}
                    left={item.item_name}
                    right={item.totalSold}
                  />
                ))
              ) : (
                <Empty />
              )}
            </ListSection>
          )}
          {canViewVendor && (
            <ListSection title="Top Vendors">
              {topVendors.length ? (
                topVendors.map((v, i) => (
                  <Row key={i} left={v.vendorName} right={`₹ ${v.total}`} />
                ))
              ) : (
                <Empty />
              )}
            </ListSection>
          )}
        </div>
      )}

      {/* ---------------- STOCK ALERTS (items.view) ---------------- */}
      {canViewItems && (
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
      )}

      {/* ---------------- PAYMENT MODES (bill.view) ---------------- */}
      {canViewBills && (
        <ListSection title="Payment Modes">
          {salesDashboard?.paymentModes?.length ? (
            salesDashboard.paymentModes.map((pm) => (
              <span
                key={pm.payment_mode}
                className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mr-2 mb-2 inline-block"
              >
                {pm.payment_mode || "Cash"}: {pm.count} bills
              </span>
            ))
          ) : (
            <Empty />
          )}
        </ListSection>
      )}

      {/* ---------------- RECENT PURCHASES (purchase.view) ---------------- */}
      {canViewPurchase && (
        <ListSection title="Recent Purchases">
          {recentPurchases.length ? (
            recentPurchases.map((p) => (
              <Row
                key={p.id}
                left={p.vendorName}
                right={`₹ ${p.totalAmount}`}
              />
            ))
          ) : (
            <Empty />
          )}
        </ListSection>
      )}
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
