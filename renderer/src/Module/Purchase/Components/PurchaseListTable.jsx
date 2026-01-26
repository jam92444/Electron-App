import { useEffect, useState } from "react";
import DataTable from "../../../components/ReuseComponents/DataTable";
import {
  getPurchaseListCursor,
  deletePurchase,
} from "../Services/purchaseService";
import toast from "react-hot-toast";

const PurchasesListTable = () => {
  const [purchases, setPurchases] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(false);

  const pageSize = 20;

  const columns = [
    { key: "id", label: "ID" },
    { key: "purchaseDate", label: "Purchase Date" },
    { key: "vendorName", label: "Vendor Name" },
    { key: "remarks", label: "Remarks" },
    {
      key: "totalAmount",
      label: "Total Amount",
      render: (val) => (
        <span className="font-medium text-gray-700">₹{val}</span>
      ),
    },
  ];

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

  const handleEdit = (index) => {
    const purchase = purchases[index];
    console.log("Edit purchase:", purchase);
  };

  const handleDelete = async (index) => {
    const purchase = purchases[index];
    const confirmed = confirm(
      `Are you sure you want to delete Purchase ID ${purchase.id}?`,
    );
    if (!confirmed) return;

    const res = await deletePurchase(purchase.id);
    if (res.success) {
      toast.success("Purchase deleted");
      setPurchases((prev) => prev.filter((p) => p.id !== purchase.id));
    } else {
      toast.error(res.error || "Failed to delete purchase");
    }
  };

  return (
    <div>
      <DataTable
        columns={columns}
        data={purchases}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

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

      {nextCursor === null && purchases.length > 0 && (
        <p className="mt-2 text-center text-gray-500">No more purchases.</p>
      )}
    </div>
  );
};

export default PurchasesListTable;
