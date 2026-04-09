/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Table, Popconfirm } from "antd";
import {
  getPurchaseList, // ⚠️ updated service
  deletePurchase,
} from "../Services/purchaseService";
import toast from "react-hot-toast";

const PurchasesListTable = ({
  onView,
  startDate,
  endDate,
  // canView,
  // canUpdate,
  // canDelete,
}) => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const fetchPurchases = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const res = await getPurchaseList({
        page,
        pageSize,
        startDate,
        endDate,
      });
      // console.log("date", startDate, endDate);

      if (res.success) {
        setPurchases(res.data);
        setPagination((prev) => ({
          ...prev,
          current: page,
          pageSize,
          total: res.total,
        }));
        // console.log(res)
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
    fetchPurchases(1, pagination.pageSize);
  }, [startDate, endDate]);

  const handleDelete = async (record) => {
    const res = await deletePurchase(record.id);

    if (res.success) {
      toast.success("Purchase deleted");
      fetchPurchases(pagination.current, pagination.pageSize);
    } else {
      toast.error(res.error || "Failed to delete purchase");
    }
  };

  const columns = [
    {
      title: "S No",
      key: "index",
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    { title: "Purchase Date", dataIndex: "purchaseDate" },
    { title: "Vendor Name", dataIndex: "vendorName" },
    { title: "Remarks", dataIndex: "remarks" },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      render: (val) => <span>₹{val}</span>,
    },
    {
      title: "Actions",
      render: (_, record) => (
        <div className="flex gap-3">
          <span
            onClick={() => onView(record)}
            style={{ color: "#1677ff", cursor: "pointer" }}
          >
            View
          </span>

          <Popconfirm
            title="Delete Purchase"
            onConfirm={() => handleDelete(record)}
          >
            <span style={{ color: "red", cursor: "pointer" }}>Delete</span>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={purchases}
      rowKey="id"
      loading={loading}
      pagination={pagination}
      onChange={(pager) => {
        fetchPurchases(pager.current, pager.pageSize);
      }}
    />
  );
};

export default PurchasesListTable;
