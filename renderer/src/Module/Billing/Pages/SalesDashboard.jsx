/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { getSalesDashboard } from "../Services/bills";
import { FaShoppingCart, FaRupeeSign, FaTags, FaBoxes } from "react-icons/fa";

const SalesDashboard = () => {
  const [dashboard, setDashboard] = useState(null);

  const fetchDashboard = async () => {
    try {
      const res = await getSalesDashboard("2026-02-01", "2026-02-05");
      if (res.success) setDashboard(res);
    } catch (err) {
      console.error("Error fetching dashboard:", err);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (!dashboard)
    return <p className="p-4 text-gray-600">Loading dashboard...</p>;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <h2 className="text-2xl font-bold text-gray-800">Sales Dashboard</h2>

      {/* ---------- TOP METRICS CARDS ---------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-blue-500 text-white rounded-lg shadow-lg flex items-center gap-4">
          <FaShoppingCart className="text-3xl" />
          <div>
            <p className="text-sm">Total Bills</p>
            <p className="text-2xl font-bold">{dashboard.totals.totalBills}</p>
          </div>
        </div>

        <div className="p-5 bg-green-500 text-white rounded-lg shadow-lg flex items-center gap-4">
          <FaRupeeSign className="text-3xl" />
          <div>
            <p className="text-sm">Total Sales</p>
            <p className="text-2xl font-bold">₹{dashboard.totals.totalSales}</p>
          </div>
        </div>

        <div className="p-5 bg-yellow-500 text-white rounded-lg shadow-lg flex items-center gap-4">
          <FaTags className="text-3xl" />
          <div>
            <p className="text-sm">Total Discount</p>
            <p className="text-2xl font-bold">
              ₹{dashboard.totals.totalDiscount}
            </p>
          </div>
        </div>

        <div className="p-5 bg-purple-500 text-white rounded-lg shadow-lg flex items-center gap-4">
          <FaBoxes className="text-3xl" />
          <div>
            <p className="text-sm">Total Pieces Sold</p>
            <p className="text-2xl font-bold">{dashboard.totals.totalPieces}</p>
          </div>
        </div>
      </div>

      {/* ---------- TOP SELLING ITEMS ---------- */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-gray-700 mb-3">Top Selling Items</h3>
        <div className="flex flex-wrap gap-2">
          {dashboard.topItems.length > 0 ? (
            dashboard.topItems.map((item) => (
              <span
                key={item.item_code}
                className="bg-orange-100 text-white px-3 py-1 rounded-full text-sm font-medium capitalize"
              >
                {item.item_name} ({item.totalSold})
              </span>
            ))
          ) : (
            <p className="text-gray-500">No items sold in this period</p>
          )}
        </div>
      </div>

      {/* ---------- PAYMENT MODES ---------- */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-gray-700 mb-3">Payment Modes</h3>
        <div className="flex flex-wrap gap-2">
          {dashboard.paymentModes.length > 0 ? (
            dashboard.paymentModes.map((pm) => (
              <span
                key={pm.payment_mode}
                className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                {pm.payment_mode || "Cash"}: {pm.count} bills
              </span>
            ))
          ) : (
            <p className="text-gray-500">No payment data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
