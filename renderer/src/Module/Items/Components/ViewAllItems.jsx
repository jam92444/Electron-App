import { Space, Table, Tag } from "antd";
import Button from "../../../components/ReuseComponents/Button";
import Modal from "../../../components/ReuseComponents/Modal";
import { deleteItem } from "../Services/items";
import { useState } from "react";
import { FaPen, FaTrashCan } from "react-icons/fa6";

const ViewAllItems = ({ items, onEdit, reload }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);

  const handleDelete = async () => {
    const itemID = items[selectedItemIndex].itemID;

    await deleteItem(itemID); // 🔥 DB delete
    await reload(); // 🔄 Refresh list
    setIsModalOpen(false); // ❌ Close modal
    setSelectedItemIndex(null);
  };
  const columns = [
    {
      title: "Item ID",
      dataIndex: "itemID",
      key: "itemID",
    },
    {
      title: "Item Name",
      dataIndex: "itemName",
      key: "itemName",
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
    },
    {
      title: "Purchase Price",
      dataIndex: "purchaseRate",
      key: "purchaseRate",
      render: (price) => `₹${price}`,
    },
    {
      title: "Vendor",
      dataIndex: "vendorName",
      key: "vendorName",
    },
    {
      title: "Purchase Date",
      dataIndex: "purchaseDate",
      key: "purchaseDate",
    },
    {
      title: "Variants / Selling Price",
      key: "variants",
      render: (_, record) =>
        record.hasVariants ? (
          record.variants.map((v, id) => (
            <Tag color="blue" key={id} className="mb-1">
              {v.size} – ₹{v.sellingPrice}
            </Tag>
          ))
        ) : (
          <Tag color="green">₹{record.sellingPrice}</Tag>
        ),
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record, index) => (
        <Space size="middle">
          <span
            className="text-blue-500 cursor-pointer"
            onClick={() => onEdit(index)}
          >
            <FaPen />
          </span>

          <span
            className="text-red-500 cursor-pointer"
            onClick={() => {
              setSelectedItemIndex(index);
              setIsModalOpen(true);
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
      <h2 className="text-md font-semibold mb-3">All Items</h2>
      <Table
        columns={columns}
        dataSource={items.map((item) => ({
          ...item,
          key: item.itemID, // stable key now
        }))}
        pagination={{ pageSize: 10, showSizeChanger: false, responsive: true }}
        bordered
        scroll={{ x: "max-content" }}
      />

      {isModalOpen && (
        <Modal
          title="Confirm Delete"
          message={`Are you sure you want to delete item "${items[selectedItemIndex]?.itemName}"?`}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedItemIndex(null);
          }}
          actions={
            <>
              <Button
                buttonName="Cancel"
                buttonType="normal"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedItemIndex(null);
                }}
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
export default ViewAllItems;
