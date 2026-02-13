/* eslint-disable react-hooks/immutability */
import { Table, Tag } from "antd";
import { useEffect, useState } from "react";
import { getBills, getBillById } from "../Services/bills";
import Modal from "../../../components/ReuseComponents/Modal";
import SalesDashboard from "./SalesDashboard";

const SalesBill = () => {
  const [bills, setBills] = useState([]);
  const [billData, setBillData] = useState(null);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  // ✅ Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // ✅ Initial load
  useEffect(() => {
    fetchBills(1, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Fetch bills from DB (paginated)
  const fetchBills = async (page = 1, pageSize = 10) => {
    const res = await getBills({ page, pageSize });

    if (res?.success) {
      setBills(res.data || []);
      setPagination({
        current: page,
        pageSize,
        total: res.pagination?.total || 0,
      });
    }
  };

  // ✅ View single bill
  const viewBill = async (record) => {
    const res = await getBillById(record.id);
    if (res?.success) {
      setBillData(res.bill);
      setItems(res.items);
      setOpen(true);
    }
  };

  // ✅ Table columns
  const columns = [
    {
      title: "Invoice No #",
      dataIndex: "invoice_number",
      width: 110,
    },
    {
      title: "Customer Name",
      dataIndex: "customer_name",
      width: 150,
      render: (v) => v || "-",
    },
    {
      title: "Contact",
      dataIndex: "customer_phone",
      width: 130,
      render: (v) => v || "-",
    },
    {
      title: "Date",
      dataIndex: "created_at",
      width: 160,
      render: (d) => new Date(d).toLocaleString("en-IN"),
    },
    {
      title: "Pieces",
      dataIndex: "total_pieces",
      width: 90,
    },
    {
      title: "Amount",
      dataIndex: "total_after_discount",
      width: 130,
      render: (a) => <b>₹{Number(a).toFixed(2)}</b>,
    },
    {
      title: "Payment",
      dataIndex: "payment_mode",
      width: 120,
      render: (p) => p || "-",
    },
    {
      title: "Discount",
      dataIndex: "discount",
      width: 120,
      render: (d = 0) => (
        <Tag color={d > 0 ? "green" : "default"}>{Number(d).toFixed(2)}%</Tag>
      ),
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6">
      {/* ---------- HEADER ---------- */}
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-gray-900">Sales Bills</h1>
        <p className="text-sm text-gray-600 italic">
          View and analyze all generated sales bills
        </p>
      </div>

      {/* ---------- TABLE CARD ---------- */}
      <div className="bg-white rounded-xl border shadow-sm p-3 sm:p-4">
        <SalesDashboard />
        <Table
          columns={columns}
          dataSource={bills.map((b) => ({ ...b, key: b.id }))}
          bordered
          size="middle"
          loading={!bills.length && pagination.current === 1}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} bills`,
          }}
          onChange={(pag) => {
            fetchBills(pag.current, pag.pageSize);
          }}
          scroll={{ x: 900 }}
          onRow={(record) => ({
            onClick: () => viewBill(record),
            className: "cursor-pointer hover:bg-gray-50",
          })}
          locale={{ emptyText: "No sales bills found" }}
        />
      </div>

      {/* ---------- BILL VIEW MODAL ---------- */}
      {open && billData && (
        <Modal
          title={`Bill #${billData.invoice_number || billData.id}`}
          onClose={() => setOpen(false)}
          actions={null}
          message={<BillView bill={billData} items={items} />}
        />
      )}
    </div>
  );
};

export default SalesBill;

/* ================== BILL VIEW ================== */

const BillView = ({ bill, items }) => {
  if (!bill) return null;

  return (
    <div className="space-y-4 text-sm">
      {/* -------- BILL HEADER -------- */}
      <div className="border rounded-lg p-3 bg-gray-50">
        <div className="grid grid-cols-2 gap-2">
          <p>
            <b>Invoice No:</b> {bill.invoice_number || `#${bill.id}`}
          </p>
          <p>
            <b>Customer Name:</b> {bill.customer_name || "-"}
          </p>
          <p>
            <b>Contact Number:</b> {bill.customer_phone || "-"}
          </p>
          <p>
            <b>Date:</b> {new Date(bill.created_at).toLocaleString("en-IN")}
          </p>
          <p>
            <b>Payment Mode:</b> {bill.payment_mode || "Cash"}
          </p>
          <p>
            <b>Total Pieces:</b> {bill.total_pieces}
          </p>
        </div>
      </div>

      {/* -------- ITEMS TABLE -------- */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full border-collapse">
          <thead className="bg-orange-100">
            <tr>
              <th className="border p-2 text-left">Item</th>
              <th className="border p-2">Size</th>
              <th className="border p-2">Qty</th>
              <th className="border p-2">Price</th>
              <th className="border p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {items?.length ? (
              items.map((it, idx) => (
                <tr key={idx}>
                  <td className="border p-2">
                    <div className="flex flex-col">
                      <span className="font-medium">{it.item_code}</span>
                      <span className="text-xs text-gray-500">
                        {it.item_name}
                      </span>
                    </div>
                  </td>
                  <td className="border p-2 text-center">{it.size || "-"}</td>
                  <td className="border p-2 text-center">{it.quantity}</td>
                  <td className="border p-2 text-right">
                    ₹{Number(it.price).toFixed(2)}
                  </td>
                  <td className="border p-2 text-right">
                    ₹{Number(it.total_amount).toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="border p-3 text-center text-gray-500"
                >
                  No items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* -------- BILL SUMMARY -------- */}
      <div className="border rounded-lg p-3 bg-gray-50 space-y-1">
        <div className="flex justify-between">
          <span>Total Amount</span>
          <span>₹{Number(bill.total_before_discount).toFixed(2)}</span>
        </div>

        {bill.discount_amount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount ({bill.discount}%)</span>
            <span>- ₹{Number(bill.discount_amount).toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between font-semibold text-base border-t pt-2">
          <span>Grand Total</span>
          <span>₹{Number(bill.total_after_discount).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
