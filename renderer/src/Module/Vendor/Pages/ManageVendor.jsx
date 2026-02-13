/* eslint-disable react-hooks/immutability */
import { Space, Table, Tag, Spin } from "antd";
import { FaPen, FaTrashCan } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import {
  deleteVendor,
  getVendors,
  getVendorDashboard,
} from "../Services/vendors";
import { useEffect, useState } from "react";
import Modal from "../../../components/ReuseComponents/Modal";
import Button from "../../../components/ReuseComponents/Button";

const ManageVendor = ({ reload }) => {
  const navigate = useNavigate();

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  // Dashboard data
  const [dashboard, setDashboard] = useState(null);

  // Pagination
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  /* ---------------- FETCH DATA ---------------- */

  useEffect(() => {
    fetchDashboard();
    fetchVendors(1, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboard = async () => {
    const res = await getVendorDashboard();
    if (res?.success) {
      setDashboard(res.summary);
    }
  };

  const fetchVendors = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const response = await getVendors();

      if (response.success) {
        // client-side pagination fallback (upgrade later to DB pagination)
        const start = (page - 1) * pageSize;
        const end = start + pageSize;

        setVendors(response.data.slice(start, end));
        setPagination({
          current: page,
          pageSize,
          total: response.data.length,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- DELETE ---------------- */

  const handleDelete = async () => {
    if (!selectedVendor) return;

    await deleteVendor(selectedVendor.id);
    setConfirmDelete(false);
    setSelectedVendor(null);

    fetchDashboard();
    fetchVendors(pagination.current, pagination.pageSize);
    reload?.();
  };

  /* ---------------- TABLE COLUMNS ---------------- */

  const columns = [
    {
      title: "Vendor Name",
      dataIndex: "vendorName",
      fixed: "left",
      width: 200,
    },
    { title: "Contact Person", dataIndex: "contactPerson", width: 160 },
    { title: "Phone", dataIndex: "phone", width: 140 },
    {
      title: "Email",
      dataIndex: "email",
      width: 220,
      render: (email) => <span className="lowercase">{email || "-"}</span>,
    },
    { title: "City", dataIndex: "city", width: 130 },
    { title: "State", dataIndex: "state", width: 130 },
    {
      title: "GST",
      dataIndex: "gstType",
      width: 120,
      render: (g) => g || "-",
    },
    {
      title: "Payment Terms",
      dataIndex: "paymentTerms",
      width: 140,
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 120,
      render: (status) => (
        <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "action",
      fixed: "right",
      width: 110,
      render: (_, record) => (
        <Space>
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() =>
              navigate("/vendor/add-vendor", {
                state: { vendor: record },
              })
            }
          >
            <FaPen />
          </span>

          <span
            className="text-red-600 cursor-pointer"
            onClick={() => {
              setSelectedVendor(record);
              setConfirmDelete(true);
            }}
          >
            <FaTrashCan />
          </span>
        </Space>
      ),
    },
  ];

  /* ---------------- UI ---------------- */

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 space-y-6">
      {/* ---------- HEADER ---------- */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Manage Vendors</h1>
        <p className="text-sm text-gray-600">
          Centralized vendor records and insights
        </p>
      </div>

      {/* ---------- DASHBOARD CARDS ---------- */}
      {dashboard && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <DashboardCard title="Total Vendors" value={dashboard.totalVendors} />
          <DashboardCard
            title="Active Vendors"
            value={dashboard.activeVendors}
            color="green"
          />
          <DashboardCard
            title="Inactive Vendors"
            value={dashboard.inactiveVendors}
            color="red"
          />
        </div>
      )}

      {/* ---------- TABLE ---------- */}
      <div className="bg-white rounded-xl border shadow-sm p-3 sm:p-4">
        <Table
          columns={columns}
          dataSource={vendors.map((v) => ({ ...v, key: v.id }))}
          loading={loading}
          bordered
          size="middle"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
          }}
          onChange={(pag) => fetchVendors(pag.current, pag.pageSize)}
          scroll={{ x: 1400 }}
          locale={{
            emptyText: loading ? <Spin /> : "No vendors found",
          }}
        />
      </div>

      {/* ---------- DELETE CONFIRM ---------- */}
      {confirmDelete && selectedVendor && (
        <Modal
          title="Confirm Delete"
          message={`Are you sure you want to delete vendor "${selectedVendor.vendorName}"?`}
          onClose={() => setConfirmDelete(false)}
          actions={
            <>
              <Button
                buttonName="Cancel"
                onClick={() => setConfirmDelete(false)}
              />
              <Button
                buttonName="Delete"
                buttonType="delete"
                onClick={handleDelete}
              />
            </>
          }
        />
      )}
    </div>
  );
};

export default ManageVendor;

/* ================= DASHBOARD CARD ================= */

const DashboardCard = ({ title, value, color = "gray" }) => (
  <div className="bg-white border rounded-xl p-4 shadow-sm">
    <p className="text-sm text-gray-500">{title}</p>
    <p className={`text-2xl font-semibold text-${color}-600`}>{value}</p>
  </div>
);
