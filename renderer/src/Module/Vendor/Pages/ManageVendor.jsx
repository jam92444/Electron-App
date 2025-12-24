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
      } else {
        console.error("Error fetching vendors:", response.error);
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
    { title: "Vendor Name", dataIndex: "vendorName", key: "vendorName" },
    {
      title: "Contact Person",
      dataIndex: "contactPerson",
      key: "contactPerson",
    },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    {
      title: "WhatsApp",
      dataIndex: "whatsapp",
      key: "whatsapp",
      render: (w) => w || "-",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email) => <span className="lowercase">{email?.toLowerCase()}</span> || "-",
    },
    { title: "Address 1", dataIndex: "address1", key: "address1" },
    {
      title: "Address 2",
      dataIndex: "address2",
      key: "address2",
      render: (a) => a || "-",
    },
    { title: "City", dataIndex: "city", key: "city" },
    { title: "State", dataIndex: "state", key: "state" },
    { title: "Country", dataIndex: "country", key: "country" },
    {
      title: "GST Type",
      dataIndex: "gstType",
      key: "gstType",
      render: (g) => g || "-",
    },
    {
      title: "GST Number",
      dataIndex: "gstNumber",
      key: "gstNumber",
      render: (g) => g || "-",
    },
    {
      title: "Bank Name",
      dataIndex: "bankName",
      key: "bankName",
      render: (b) => b || "-",
    },
    {
      title: "Account Holder",
      dataIndex: "accountHolder",
      key: "accountHolder",
      render: (a) => a || "-",
    },
    {
      title: "Account Number",
      dataIndex: "accountNumber",
      key: "accountNumber",
      render: (a) => a || "-",
    },
    { title: "IFSC", dataIndex: "ifsc", key: "ifsc", render: (i) => i || "-" },
    { title: "UPI", dataIndex: "upi", key: "upi", render: (u) => u || "-" },
    { title: "Payment Terms", dataIndex: "paymentTerms", key: "paymentTerms" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <Space>
          <span
            className="text-blue-500 cursor-pointer"
            onClick={() =>
              navigate("/vendor/add-vendor", { state: { vendor: record } })
            }
          >
            <FaPen />
          </span>

          <span
            className="text-red-500 cursor-pointer"
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
    <div className="p-3 sm:p-6 rounded-lg shadow-xl sm:border mt-8">
      <h2 className="text-lg  sm:text-xl uppercase font-semibold mb-3">All Vendors</h2>
      <Table
        columns={columns}
        dataSource={vendors.map((v, idx) => ({ ...v, key: idx }))}
        bordered
        scroll={{ x: "max-content" }} // enable horizontal scroll for many columns
        locale={{ emptyText: "No vendors found" }}
      />

      {confirmDelete && selectedVendor && (
        <Modal
          title="Confirm Delete"
          message={`Delete vendor "${selectedVendor.vendorName}"?`}
          onClose={() => setConfirmDelete(false)}
          actions={
            <>
              <Button
                buttonName="Cancel"
                onClick={() => setConfirmDelete(false)}
              />
              <Button
                buttonName="Delete"
                buttonType="save"
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
