import { useEffect } from "react";

const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /* ---------------- DUMMY DATA ---------------- */
  const stats = [
    { label: "Total Sales", value: "₹1,24,500" },
    { label: "Total Purchases", value: "₹82,300" },
    { label: "Cash Sales", value: "₹64,200" },
    { label: "Online Sales", value: "₹60,300" },
    { label: "Pending Invoices", value: "12" },
  ];

  const monthlySales = [
    { month: "Jan", amount: 18000 },
    { month: "Feb", amount: 22000 },
    { month: "Mar", amount: 19500 },
    { month: "Apr", amount: 26000 },
    { month: "May", amount: 30000 },
    { month: "Jun", amount: 34000 },
  ];

  const invoices = [
    {
      invoice: "INV-001",
      customer: "Rahul Traders",
      amount: "₹5,200",
      payment: "Cash",
      status: "Paid",
    },
    {
      invoice: "INV-002",
      customer: "Amit Enterprises",
      amount: "₹8,750",
      payment: "Online",
      status: "Paid",
    },
    {
      invoice: "INV-003",
      customer: "Sharma Stores",
      amount: "₹3,400",
      payment: "Cash",
      status: "Pending",
    },
    {
      invoice: "INV-004",
      customer: "Kunal Mart",
      amount: "₹12,900",
      payment: "Online",
      status: "Paid",
    },
  ];

  const maxSale = Math.max(...monthlySales.map((m) => m.amount));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* ---------------- HEADER ---------------- */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Sales, purchases & invoice analytics overview
        </p>
      </div>

      {/* ---------------- KPI CARDS ---------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border p-4"
          >
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* ---------------- ANALYTICS ---------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* SALES CHART */}
        <div className="bg-white rounded-xl shadow-sm border p-6 lg:col-span-2">
          <h2 className="font-semibold text-gray-800 mb-4">
            Monthly Sales Overview
          </h2>

          <div className="flex items-end gap-4 h-48">
            {monthlySales.map((m, i) => (
              <div key={i} className="flex flex-col items-center w-full">
                <div
                  className="w-8 rounded-md bg-blue-600"
                  style={{
                    height: `${(m.amount / maxSale) * 100}%`,
                  }}
                />
                <span className="text-xs mt-2 text-gray-600">
                  {m.month}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* PAYMENT SPLIT */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="font-semibold text-gray-800 mb-4">
            Payment Breakdown
          </h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Cash Payments</p>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
                <div className="bg-green-500 h-3 rounded-full w-[52%]" />
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Online Payments</p>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
                <div className="bg-blue-500 h-3 rounded-full w-[48%]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- RECENT INVOICES ---------------- */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-800">
            Recent Invoices
          </h2>

          <div className="flex gap-2">
            <button className="text-sm px-3 py-1 border rounded-md">
              Today
            </button>
            <button className="text-sm px-3 py-1 border rounded-md">
              This Month
            </button>
            <button className="text-sm px-3 py-1 border rounded-md">
              This Year
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="text-left p-3">Invoice</th>
                <th className="text-left p-3">Customer</th>
                <th className="text-left p-3">Amount</th>
                <th className="text-left p-3">Payment</th>
                <th className="text-left p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, i) => (
                <tr
                  key={i}
                  className="border-b last:border-none hover:bg-gray-50"
                >
                  <td className="p-3 font-medium">{inv.invoice}</td>
                  <td className="p-3">{inv.customer}</td>
                  <td className="p-3">{inv.amount}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        inv.payment === "Cash"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {inv.payment}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        inv.status === "Paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Home;
