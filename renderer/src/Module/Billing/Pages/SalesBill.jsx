/* eslint-disable react-hooks/immutability */
import { Table, Tag } from "antd";
import { useEffect, useState } from "react";
import { getBills, getBillById } from "../Services/bills";
import Modal from "../../../components/ReuseComponents/Modal";

const SalesBill = () => {
  const [bills, setBills] = useState([]);
  const [billData, setBillData] = useState(null);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    const res = await getBills();
    if (res.success) setBills(res.data);
  };

  const viewBill = async (record) => {
    const res = await getBillById(record.id);
    if (res.success) {
      setBillData(res.bill);
      setItems(res.items);
      setOpen(true);
    }
  };

  const columns = [
    { title: "Bill #", dataIndex: "id", width: 90 },
    { title: "Date", dataIndex: "created_at", width: 140 },
    { title: "Pieces", dataIndex: "total_pieces", width: 100 },
    {
      title: "Amount",
      dataIndex: "total_after_discount",
      width: 140,
      render: (a) => <b>₹{a}</b>,
    },
    {
      title: "Payment",
      dataIndex: "payment_mode",
      width: 140,
      render: (p) => p || "-",
    },
    {
      title: "Discount",
      dataIndex: "discount",
      width: 120,
      render: (d) => (
        <Tag color={d > 0 ? "green" : "default"}>{d || 0}%</Tag>
      ),
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6">
      {/* ---------- HEADER ---------- */}
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-gray-900">
          Sales Bills
        </h1>
        <p className="text-sm text-gray-600">
          View and analyze all generated sales bills
        </p>
      </div>

      {/* ---------- TABLE CARD ---------- */}
      <div className="bg-white rounded-xl border shadow-sm p-3 sm:p-4">
        <Table
          columns={columns}
          dataSource={bills.map((b) => ({ ...b, key: b.id }))}
          bordered
          size="middle"
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 800 }}
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
          title={`Bill #${billData.id}`}
          onClose={() => setOpen(false)}
          actions={null}
          message={<BillView bill={billData} items={items} />}
        />
      )}
    </div>
  );
};

export default SalesBill;
