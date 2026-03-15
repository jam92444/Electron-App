import React, { useEffect, useRef, useState } from "react";
import DataTable from "../../../components/ReuseComponents/DataTable";
import toast from "react-hot-toast";
import { getPurchaseListCursor } from "../../Purchase/Services/purchaseService";
import { getItemsByPurchaseIds } from "../Services/labelServices";
import { getCompanyDetails } from "../../Settings/Services/settingService";
import { Tag } from "antd";
import Button from "../../../components/ReuseComponents/Button";
import Modal from "../../../components/ReuseComponents/Modal";
import { useStateContext } from "../../../context/StateContext";

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const buildLabels = (items) => {
  const labels = [];
  items.forEach((item) => {
    if (item.hasVariants && item.variants?.length) {
      item.variants.forEach((v) => {
        for (let i = 0; i < (v.quantity || 1); i++) {
          labels.push({
            itemName: item.itemName,
            itemID: item.itemID,
            unit: item.unit,
            size: v.size,
            price: v.sellingPrice,
            vendor: item.vendorName,
          });
        }
      });
    } else {
      for (let i = 0; i < (item.quantity || 1); i++) {
        labels.push({
          itemName: item.itemName,
          unit: item.unit,
          itemID: item.itemID,
          size: null,
          price: item.sellingPrice,
          vendor: item.vendorName,
        });
      }
    }
  });
  return labels;
};

const printLabels = (items, company = {}) => {
  const labels = buildLabels(items);
  if (!labels.length) return toast.error("No labels to print");

  const storeName = company.companyName || "Store Name";
  const storePhone = company.contactNumber || "";

  const printWindow = window.open("", "", "width=900,height=650");
  printWindow.document.write(`
    <html>
      <head>
        <title>Print Labels</title>
        <style>
          @page { size: A4; margin: 10mm; }
          body { margin: 0; font-family: "Arial Black", Arial, sans-serif; }
          table { width: 100%; border-collapse: collapse; }
          td { width: 16.66%; padding: 4mm 2mm; vertical-align: top; border: 1px solid black; }
          .label { text-align: center; }
          .label h3 { font-size: 12px; margin: 0 0 8px 0; font-weight: bold; }
          .label p { margin: 2px 0; font-size: 12px; text-transform: uppercase; font-weight: 600; }
          .vendor { font-size: 10px; }
        </style>
      </head>
      <body>
        <table><tbody>
          ${buildLabels(items)
            .reduce((rows, label, idx) => {
              if (idx % 6 === 0) rows.push([]);
              rows[rows.length - 1].push(label);
              return rows;
            }, [])
            .map(
              (row) => `
              <tr>
                ${row
                  .map(
                    (l) => `
                  <td>
                    <div class="label">
                      <h3>${storeName}</h3>
                      <p>Price: <strong>₹${l.price}/-</strong></p>
                      <p>Size: ${l.size ?? "0"}</p>
                      ${storePhone ? `<p class="vendor"><small>pH.</small> ${storePhone}</p>` : ""}
                      <p>No: ${l.itemID}</p>
                    </div>
                  </td>
                `,
                  )
                  .join("")}
                ${"<td></td>".repeat(6 - row.length)}
              </tr>
            `,
            )
            .join("")}
        </tbody></table>
        <script>window.onload = () => { window.print(); window.close(); };</script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

/* ─── Column definitions ─────────────────────────────────────────────────── */
const PURCHASE_COLUMNS = [
  { key: "vendorName", label: "Vendor" },
  { key: "purchaseDate", label: "Date" },
  { key: "totalAmount", label: "Amount", render: (v) => `₹${v}` },
  { key: "remarks", label: "Remarks" },
  { key: "created_at", label: "Created" },
];

const ITEM_COLUMNS = [
  { key: "itemID", label: "Item ID" },
  { key: "itemName", label: "Item Name" },
  {
    key: "unit",
    label: "Unit",
    render: (t) => <span className="capitalize">{t}</span>,
  },
  {
    key: "variants",
    label: "Variants / Price",
    render: (_, record) =>
      record.hasVariants ? (
        <div className="flex flex-wrap gap-1">
          {record.variants.map((v) => (
            <Tag key={v.id} color="blue">
              {v.size} / ₹{v.sellingPrice} × {v.quantity}
            </Tag>
          ))}
        </div>
      ) : (
        <Tag color="green">
          ₹{record.sellingPrice} × {record.quantity}
        </Tag>
      ),
  },
];

/* ─── Main Component ─────────────────────────────────────────────────────── */
const GenerateLabel = () => {
  const { state } = useStateContext();

  // ── Permissions ──
  const canCreate =
    state.user.permissions.includes("label.create") ||
    state.user.permissions.includes("*.*");
  const canView =
    state.user.permissions.includes("label.view") ||
    state.user.permissions.includes("*.*");

  const [purchases, setPurchases] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fetchingItems, setFetchingItems] = useState(false);
  const [selectedPurchases, setSelectedPurchases] = useState([]);
  const [items, setItems] = useState([]);
  const [companyDetails, setCompanyDetails] = useState({});
  const [accessModal, setAccessModal] = useState(null);
  const itemsSectionRef = useRef(null);

  const pageSize = 20;

  useEffect(() => {
    if (!canView) return; // don't fetch if no view permission
    fetchPurchases();
    getCompanyDetails().then((res) => {
      if (res?.success) setCompanyDetails(res.data);
    });
  }, []);

  /* ── Fetch purchases ── */
  const fetchPurchases = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await getPurchaseListCursor({
        lastId: nextCursor ?? Number.MAX_SAFE_INTEGER,
        pageSize,
      });
      if (res.success) {
        setPurchases((prev) => [...prev, ...res.data]);
        setNextCursor(res.nextCursor);
        setHasMore(!!res.nextCursor);
      } else toast.error(res.error);
    } catch {
      toast.error("Failed to fetch purchases");
    } finally {
      setLoading(false);
    }
  };

  /* ── Selection helpers ── */
  const allSelected =
    purchases.length > 0 &&
    purchases.every((p) => selectedPurchases.includes(p.id));

  const toggleSelectAll = () => {
    setSelectedPurchases(allSelected ? [] : purchases.map((p) => p.id));
  };

  const toggleSelectPurchase = (id) => {
    setSelectedPurchases((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  /* ── Fetch items for selected purchases ── */
  const fetchItems = async () => {
    if (!selectedPurchases.length)
      return toast.error("Select at least one purchase");
    setFetchingItems(true);
    try {
      const res = await getItemsByPurchaseIds(selectedPurchases);
      if (res.success) {
        setItems(res.data);
        setTimeout(
          () => itemsSectionRef.current?.scrollIntoView({ behavior: "smooth" }),
          100,
        );
      } else toast.error(res.error);
    } catch {
      toast.error("Failed to fetch items");
    } finally {
      setFetchingItems(false);
    }
  };

  const handleReset = () => {
    setSelectedPurchases([]);
    setItems([]);
  };

  const handlePrint = () => {
    if (!canCreate) {
      setAccessModal({
        title: "Access Denied",
        message: "You do not have permission to generate labels.",
      });
      return;
    }
    printLabels(items, companyDetails);
  };

  const handleContinue = () => {
    if (!canView) {
      setAccessModal({
        title: "Access Denied",
        message: "You do not have permission to view label items.",
      });
      return;
    }
    fetchItems();
  };

  const labelCount = items.length ? buildLabels(items).length : 0;

  /* ── No view permission screen ── */
  if (!canView) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-2xl">🔒</p>
          <p className="text-gray-700 font-medium">Access Denied</p>
          <p className="text-sm text-gray-400">
            You do not have permission to view labels.
          </p>
        </div>
      </div>
    );
  }

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Label Generation</h1>
        <p className="text-sm text-gray-500 mt-1">
          Select purchases to generate and print item labels.
        </p>
      </div>

      {/* ── Purchases Table ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Purchase Orders</h2>
          {selectedPurchases.length > 0 && (
            <span className="text-xs bg-green-100 text-green-700 border border-green-200 px-2 py-1 rounded-full font-medium">
              {selectedPurchases.length} selected
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-2 text-left w-10">
                  <input
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer accent-orange-500"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                  />
                </th>
                {PURCHASE_COLUMNS.map((c) => (
                  <th
                    key={c.key}
                    className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {purchases.length === 0 && !loading ? (
                <tr>
                  <td
                    colSpan={PURCHASE_COLUMNS.length + 1}
                    className="text-center py-10 text-gray-400"
                  >
                    <p className="text-2xl mb-1">📦</p>
                    <p className="text-sm">No purchases found</p>
                  </td>
                </tr>
              ) : (
                purchases.map((p) => {
                  const isSelected = selectedPurchases.includes(p.id);
                  return (
                    <tr
                      key={p.id}
                      onClick={() => toggleSelectPurchase(p.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-orange-50 border-l-2 border-l-orange-400"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-3 py-2.5">
                        <input
                          type="checkbox"
                          className="h-4 w-4 cursor-pointer accent-orange-500"
                          checked={isSelected}
                          onChange={() => toggleSelectPurchase(p.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      {PURCHASE_COLUMNS.map((c) => (
                        <td key={c.key} className="px-3 py-2.5 text-gray-700">
                          {c.render ? c.render(p[c.key]) : p[c.key] || "—"}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Load more */}
        {hasMore && (
          <button
            onClick={fetchPurchases}
            disabled={loading}
            className="mt-4 text-sm text-orange-500 hover:underline disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load more purchases"}
          </button>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={handleReset}
            disabled={!selectedPurchases.length && !items.length}
            className="text-sm text-red-500 hover:underline disabled:opacity-40"
          >
            Reset selection
          </button>
          <button
            onClick={handleContinue}
            disabled={!selectedPurchases.length || fetchingItems}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPurchases.length
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {fetchingItems ? "Loading items..." : `Continue →`}
          </button>
        </div>
      </div>

      {/* ── Items Table ── */}
      {items.length > 0 && (
        <div
          ref={itemsSectionRef}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-800">Items to Label</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {items.length} item types ·{" "}
                <span className="font-medium text-orange-600">
                  {labelCount} labels
                </span>{" "}
                will be printed
              </p>
            </div>
          </div>

          <DataTable columns={ITEM_COLUMNS} data={items} action={false} />

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
            <Button
              buttonName="Done"
              buttonType="cancel"
              onClick={handleReset}
            />
            {canCreate && (
              <Button
                buttonName={`Print ${labelCount} Labels`}
                buttonType="save"
                onClick={handlePrint}
              />
            )}
          </div>
        </div>
      )}

      {/* ── Access Denied Modal ── */}
      {accessModal && (
        <Modal
          title={accessModal.title}
          message={accessModal.message}
          onClose={() => setAccessModal(null)}
          actions={
            <Button
              buttonName="OK"
              buttonType="save"
              onClick={() => setAccessModal(null)}
            />
          }
        />
      )}
    </div>
  );
};

export default GenerateLabel;
