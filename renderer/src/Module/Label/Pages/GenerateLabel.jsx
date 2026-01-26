import React, { useEffect, useState } from "react";
import DataTable from "../../../components/ReuseComponents/DataTable";
import toast from "react-hot-toast";
import { getPurchaseListCursor } from "../../Purchase/Services/purchaseService";
import { getItemsByPurchaseIds } from "../Services/labelServices";

const GenerateLabel = () => {
  const [purchases, setPurchases] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(false);

  const [selectedPurchases, setSelectedPurchases] = useState([]); // multiple selection
  const [items, setItems] = useState([]);

  const pageSize = 20;

  // --- Columns for purchase order table ---
  const purchaseColumns = [
    { key: "id", label: "ID" },
    { key: "purchaseDate", label: "Purchase Date" },
    { key: "vendorName", label: "Vendor Name" },
    { key: "totalAmount", label: "Total Amount", render: (val) => `₹${val}` },
    { key: "remarks", label: "Remarks" },
  ];

  // --- Columns for items table ---
  const itemColumns = [
    { key: "itemID", label: "Item ID" },
    { key: "itemName", label: "Item Name" },
    { key: "size", label: "Size" },
    { key: "quantity", label: "Quantity" },
    { key: "sellingPrice", label: "Selling Price", render: (val) => `₹${val}` },
  ];

  // --- Fetch purchases (cursor-based) ---
  const fetchPurchases = async () => {
    if (loading || (nextCursor === null && purchases.length > 0)) return;

    setLoading(true);
    try {
      const res = await getPurchaseListCursor({
        lastId: nextCursor ?? Number.MAX_SAFE_INTEGER,
        pageSize,
      });

      if (res.success) {
        setPurchases((prev) => [...prev, ...res.data]);
        setNextCursor(res.nextCursor);
      } else {
        toast.error(res.error || "Failed to fetch purchases");
      }
    } catch (err) {
      console.error(err);
      toast.error("API call failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  // --- Handle checkbox toggle ---
  const toggleSelectPurchase = (purchaseId) => {
    setSelectedPurchases((prev) =>
      prev.includes(purchaseId)
        ? prev.filter((id) => id !== purchaseId)
        : [...prev, purchaseId],
    );
  };

  // --- Fetch items for selected purchases ---
  const fetchItems = async () => {
    if (selectedPurchases.length === 0)
      return toast.error("Select at least one purchase");

    try {
      const res = await getItemsByPurchaseIds(selectedPurchases);

      if (res.success) {
        setItems(res.data);
      } else {
        toast.error(res.error || "Failed to fetch items");
      }
    } catch (err) {
      console.error(err);
      toast.error("API call failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Label Generation</h1>
        <p className="text-sm text-gray-600 italic">
          Generate and manage product labels quickly and efficiently.
        </p>
      </div>

      {/* --- Purchase Orders Table with checkboxes --- */}
      <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-lg">Select Purchase Orders</h2>

        <table className="min-w-[400px] w-fit sm:w-full text-sm border-collapse">
          <thead className="bg-orange-100 text-white">
            <tr>
              <th className="p-2 pl-4 text-left">Select</th>
              {purchaseColumns.map((col) => (
                <th key={col.key} className="p-2 text-left">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {purchases.map((row) => (
              <tr
                key={row.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {/* Checkbox */}
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selectedPurchases.includes(row.id)}
                    onChange={() => toggleSelectPurchase(row.id)}
                  />
                </td>

                {purchaseColumns.map((col) => (
                  <td key={col.key} className="p-2 text-gray-800">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {nextCursor !== null && (
          <div className="mt-4 text-center">
            <button
              onClick={fetchPurchases}
              disabled={loading}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}

        <div className="mt-4 text-right">
          <button
            onClick={fetchItems}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Continue
          </button>
        </div>
      </div>

      {/* --- Items Table --- */}
      {items.length > 0 && (
        <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-lg">Selected Items</h2>
          <DataTable columns={itemColumns} data={items} />
        </div>
      )}
    </div>
  );
};

export default GenerateLabel;
