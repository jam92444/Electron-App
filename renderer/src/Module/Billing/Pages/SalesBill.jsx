/* eslint-disable react-hooks/immutability */
import { Table, Tag } from "antd";
import { useEffect, useState } from "react";
import { getBills, getBillById } from "../services/bills";
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
    { title: "Bill #", dataIndex: "id", key: "id" },
    { title: "Date", dataIndex: "created_at", key: "created_at" },
    { title: "Pieces", dataIndex: "total_pieces", key: "total_pieces" },
    {
      title: "Amount",
      dataIndex: "total_after_discount",
      key: "total_after_discount",
    },
    {
      title: "Payment",
      dataIndex: "payment_mode",
      key: "payment_mode",
      render: (p) => p || "-",
    },
    {
      title: "Discount",
      dataIndex: "discount",
      key: "discount",
      render: (d) => <Tag color={d > 0 ? "green" : "default"}>{d}%</Tag>,
    },
  ];

  return (
    <div className="p-6 border rounded shadow mt-6">
      <h2 className="text-xl font-semibold mb-4">Bills</h2>

      <Table
        columns={columns}
        dataSource={bills.map((b) => ({ ...b, key: b.id }))}
        bordered
        onRow={(record) => ({
          onClick: () => viewBill(record),
          style: { cursor: "pointer" },
        })}
      />

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

const BillView = ({ bill, items }) => {
  const itemColumns = [
    { title: "Code", dataIndex: "item_code", key: "item_code", width: 120 },
    {
      title: "Item Name",
      dataIndex: "item_name",
      key: "item_name",
      width: 180,
    },
    {
      title: "Size",
      dataIndex: "size",
      key: "size",
      width: 80,
      render: (s) => s || "-",
    },
    { title: "Price", dataIndex: "price", key: "price", width: 100 },
    { title: "Qty", dataIndex: "quantity", key: "quantity", width: 80 },
    {
      title: "Total",
      dataIndex: "total_amount",
      key: "total_amount",
      width: 120,
    },
  ];

  console.log(bill,"bill")

  return (
    <div className="space-y-4">
      {/* Bill Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm border p-3 rounded">
        <div>
          <b>Date:</b> {bill.created_at}
        </div>
        <div>
          <b>Payment:</b> {bill.payment_mode || "-"}
        </div>
        <div>
          <b>Total Pieces:</b> {bill.total_pieces}
        </div>
        <div>
          <b>Before Discount:</b> ₹{bill.total_before_discount}
        </div>
        {bill.discount != null && bill.discount > 0 && (
          <div>
            <b>Discount:</b> {bill.discount}%
          </div>
        )}

        {bill.discount_amount != null && bill.discount_amount > 0 && (
          <div>
            <b>Discount Amount:</b> ₹{bill.discount_amount}
          </div>
        )}

        <div className="sm:col-span-2 text-base sm:text-lg font-semibold">
          Total: ₹{bill.total_after_discount}
        </div>
      </div>

      {/* Items Table with horizontal scroll */}
      <div className="w-full overflow-x-auto ">
        <Table
          columns={itemColumns}
          dataSource={items.map((i) => ({ ...i, key: i.id }))}
          pagination={false}
          bordered
          size="small"
          scroll={{ x: 700 }} // 👈 forces horizontal scroll
        />
      </div>
    </div>
  );
};
