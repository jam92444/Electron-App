/* eslint-disable react-hooks/immutability */
import { Space, Table, Tag } from "antd";
import { FaPen, FaTrashCan } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { deleteVendor, getVendors } from "../Services/vendors";
import { useEffect, useState } from "react";
import Modal from "../../../components/ReuseComponents/Modal";
import Button from "../../../components/ReuseComponents/Button";

const ManageVendor = ({ reload }) => {
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await getVendors();
      if (response.success) {
        setVendors(response.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!selectedVendor) return;
    await deleteVendor(selectedVendor.id);
    setConfirmDelete(false);
    setSelectedVendor(null);
    fetchVendors();
    reload?.();
  };

  const columns = [
    {
      title: "Vendor Name",
      dataIndex: "vendorName",
      fixed: "left",
      width: 180,
    },
    { title: "Contact Person", dataIndex: "contactPerson", width: 160 },
    { title: "Phone", dataIndex: "phone", width: 130 },
    {
      title: "WhatsApp",
      dataIndex: "whatsapp",
      width: 130,
      render: (w) => w || "-",
    },
    {
      title: "Email",
      dataIndex: "email",
      width: 200,
      render: (email) => (
        <span className="lowercase">{email?.toLowerCase() || "-"}</span>
      ),
    },
    { title: "City", dataIndex: "city", width: 120 },
    { title: "State", dataIndex: "state", width: 120 },
    { title: "Country", dataIndex: "country", width: 100 },
    {
      title: "GST Type",
      dataIndex: "gstType",
      width: 120,
      render: (g) => g || "-",
    },
    {
      title: "GST Number",
      dataIndex: "gstNumber",
      width: 160,
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
      width: 110,
      render: (status) => (
        <Tag color={status === "Active" ? "green" : "red"}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "action",
      fixed: "right",
      width: 110,
      render: (_, record) => (
        <Space size="middle">
          <span
            className="text-blue-600 hover:text-blue-800 cursor-pointer"
            onClick={() =>
              navigate("/vendor/add-vendor", { state: { vendor: record } })
            }
          >
            <FaPen />
          </span>

          <span
            className="text-red-500 hover:text-red-700 cursor-pointer"
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

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6">
      {/* ---------- PAGE HEADER ---------- */}
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-gray-900">
          Manage Vendors
        </h1>
        <p className="text-sm text-gray-600">
          View, edit, and manage all registered vendors
        </p>
      </div>

      {/* ---------- TABLE CARD ---------- */}
      <div className="bg-white rounded-xl border shadow-sm p-3 sm:p-4">
        <Table
          columns={columns}
          dataSource={vendors.map((v, idx) => ({ ...v, key: idx }))}
          bordered
          size="middle"
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 1400 }}
          locale={{ emptyText: "No vendors found" }}
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
