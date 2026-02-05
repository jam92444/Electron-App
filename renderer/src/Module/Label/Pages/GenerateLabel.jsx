import React, { useEffect, useState } from "react";
import DataTable from "../../../components/ReuseComponents/DataTable";
import toast from "react-hot-toast";
import { getPurchaseListCursor } from "../../Purchase/Services/purchaseService";
import { getItemsByPurchaseIds } from "../Services/labelServices";
import { Tag } from "antd";
import Button from "../../../components/ReuseComponents/Button";

/* =========================
   HELPERS
========================= */

// Build individual labels based on quantity
const buildLabels = (items) => {
  const labels = [];

  items.forEach((item) => {
    if (item.hasVariants && item.variants?.length) {
      // console.log(item, "label Items");
      item.variants.forEach((v) => {
        const qty = v.quantity || 1;
        for (let i = 0; i < qty; i++) {
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
      const qty = item.quantity || 1;
      for (let i = 0; i < qty; i++) {
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
  // console.log(labels, "labels");
  return labels;
};

// Print labels in A4
const printLabels = (items) => {
  const labels = buildLabels(items);
  if (!labels.length) return toast.error("No labels to print");

  const printWindow = window.open("", "", "width=900,height=650");

  printWindow.document.write(`
  <html>
    <head>
      <title>Print Labels</title>
      <style>
        @page {
        size: A4;
        margin: 10mm;
      }

      body {
        margin: 0;
        font-family: "Arial Black", Arial, sans-serif;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        page-break-inside: avoid;
      }

      td {
        width: 16.66%; /* 6 labels per row */
        padding: 4mm 2mm;
        vertical-align: top;
        border: 1px solid black;
      }

      .label h3 {
        font-size: 12px;
        margin: 0 0 4px 0;
        margin-bottom: 10px;
        text-align: center;
        font-weight: bold;
      }

      .label p {
        margin: 2px 0;
        font-size: 12px;
        text-transform: uppercase;
        font-weight: 600;
        text-align: center;
      }

      .vendor {
        font-size: 10px;
        color: #000000;
      }
      </style>
    </head>

    <body>
      <table>
        <tbody>
          ${labels
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
                            <h3>AC <br />KIDS WEAR</h3>
                            <p>Price: <strong>₹${l.price}/-</strong></p>
                            <p>Size: ${l.size === null ? "0" : l.size}</p>
                            <p class="vendor"><small style="font-size: 8px">pH.</small> 924437480</p>
                            <p>No: ${l.itemID}</p>
                          </div>
                        </td>
                      `,
                    )
                    .join("")}
                  ${row.length < 6 ? "<td></td>".repeat(6 - row.length) : ""}
                </tr>

                 
              `,
            )
            .join("")}
        </tbody>
      </table>

      <script>
        window.onload = () => {
          window.print();
          window.close();
        };
      </script>
    </body>
  </html>
`);

  printWindow.document.close();
};

/* =========================
   COMPONENT
========================= */

const GenerateLabel = () => {
  const [purchases, setPurchases] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(false);

  const [selectedPurchases, setSelectedPurchases] = useState([]);
  const [items, setItems] = useState([]);

  const pageSize = 20;

  /* ------------------------
     TABLE COLUMNS
  ------------------------- */
  const purchaseColumns = [
    { key: "vendorName", label: "Vendor Name" },
    { key: "purchaseDate", label: "Purchase Date" },
    {
      key: "totalAmount",
      label: "Total Amount",
      render: (val) => `₹${val}`,
    },
    { key: "remarks", label: "Remarks" },
    { key: "created_at", label: "Created Date" },
  ];

  const itemColumns = [
    { key: "itemID", label: "Item ID" },
    { key: "itemName", label: "Item Name" },
    {
      key: "unit",
      label: "Unit",
      render: (text) => <span className="capitalize">{text}</span>,
    },
    {
      key: "variants",
      label: "Variants / Selling Price",
      render: (_, record) =>
        record.hasVariants ? (
          <div className="flex flex-wrap gap-2">
            {record.variants.map((v) => (
              <Tag key={v.id} color="blue">
                Size {v.size} / ₹{v.sellingPrice} × {v.quantity}
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

  /* ------------------------
     DATA FETCH
  ------------------------- */

  const fetchPurchases = async () => {
    if (loading || (nextCursor === null && purchases.length)) return;

    setLoading(true);
    try {
      const res = await getPurchaseListCursor({
        lastId: nextCursor ?? Number.MAX_SAFE_INTEGER,
        pageSize,
      });

      if (res.success) {
        setPurchases((prev) => [...prev, ...res.data]);
        setNextCursor(res.nextCursor);
      } else toast.error(res.error);
    } catch {
      toast.error("Failed to fetch purchases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const toggleSelectPurchase = (id) => {
    setSelectedPurchases((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const fetchItems = async () => {
    if (!selectedPurchases.length)
      return toast.error("Select at least one purchase");

    try {
      const res = await getItemsByPurchaseIds(selectedPurchases);
      if (res.success) setItems(res.data);
      else toast.error(res.error);
    } catch {
      toast.error("Failed to fetch items");
    }
  };

  const handleResetPage = () => {
    setSelectedPurchases([]);
    setItems([]);
  };

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <h1 className="text-xl font-bold">Label Generation</h1>

      {/* PURCHASE TABLE */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-semibold mb-4">Select Purchase Orders</h2>

        <table className="w-full border-collapse text-sm rounded">
          <thead className="bg-orange-100 text-white text-start">
            <tr className="text-start">
              {purchaseColumns.map((c) => (
                <th className="p-2 text-start" key={c.key}>
                  {c.label}
                </th>
              ))}
              <th className="p-2 text-start">Select</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((p) => (
              <tr key={p.id} className="border-b">
                {purchaseColumns.map((c) => (
                  <td className="p-2 text-start" key={c.key}>
                    {c.render ? c.render(p[c.key]) : p[c.key]}
                  </td>
                ))}
                <td className="pl-4">
                  <input
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer"
                    checked={selectedPurchases.includes(p.id)}
                    onChange={() => toggleSelectPurchase(p.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {nextCursor && (
          <button
            onClick={fetchPurchases}
            disabled={loading}
            className="mt-4 bg-orange-500 text-white px-4 py-2 rounded"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        )}

        <div className="text-right mt-4 ">
          <button
            onClick={fetchItems}
            className={`${selectedPurchases.length <= 0 ? "bg-gray-400 text-gray-800 cursor-not-allowed" : "bg-green-500 text-white"}  px-4 py-2 rounded ml-2 hover:scale-95 transition-all`}
            disabled={selectedPurchases.length <= 0 ? true : false}
          >
            Continue
          </button>
          <button
            onClick={() => setSelectedPurchases([])}
            disabled={selectedPurchases.length <= 0 ? true : false}
            className={`${selectedPurchases.length <= 0 ? "bg-gray-400 text-gray-800 cursor-not-allowed" : "bg-red-500 text-white"}  px-4 py-2 rounded ml-2 hover:scale-95 transition-all`}
          >
            Reset
          </button>
        </div>
      </div>

      {/* ITEMS TABLE */}
      {items.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-4">Selected Items</h2>
          <DataTable columns={itemColumns} data={items} action={false} />

          <div className="flex justify-end gap-2 mt-4">
            <Button
              buttonName="Print Label"
              buttonType="save"
              onClick={() => printLabels(items)}
            />
            <Button
              buttonName={"Done"}
              buttonType="cancel"
              onClick={() => handleResetPage()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateLabel;
