import { useState } from "react";
import { Table, Button, Modal, Tag } from "antd";
import { deleteDiscount } from "../Services/discount.services";
import { useStateContext } from "../../../context/StateContext";

const ViewAllDiscounts = ({ discounts, onEdit, reload }) => {
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const { state } = useStateContext();

  const canDelete =
    state.user.permissions.includes("discount.delete") ||
    state.user.permissions.includes("*.*");

  const handleDelete = async () => {
    await deleteDiscount(confirmDelete.id);
    setConfirmDelete(null);
    reload();
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Discount (%)",
      dataIndex: "percentage",
      key: "percentage",
    },
    {
      title: "Valid Days",
      dataIndex: "valid_days",
      key: "valid_days",
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      render: (value) =>
        value == 1 ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag color="red">Inactive</Tag>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <>
          <Button
            className="font-karla"
            type="link"
            onClick={() => onEdit(record)}
          >
            Edit
          </Button>

          <Button
            type="link"
            danger
            className="font-karla"
            onClick={() =>
              canDelete ? setConfirmDelete(record) : setPermissionDenied(true)
            }
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={discounts}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      {/* Permission Denied Modal */}
      <Modal
        title="Permission Denied"
        open={permissionDenied}
        onCancel={() => setPermissionDenied(false)}
        footer={[
          <Button key="ok" onClick={() => setPermissionDenied(false)}>
            OK
          </Button>,
        ]}
      >
        <p>
          You don't have permission to delete discounts. Contact your admin.
        </p>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal
        title="Confirm Deletion"
        open={!!confirmDelete}
        onCancel={() => setConfirmDelete(null)}
        footer={[
          <Button key="cancel" onClick={() => setConfirmDelete(null)}>
            Cancel
          </Button>,
          <Button key="delete" danger type="primary" onClick={handleDelete}>
            Delete
          </Button>,
        ]}
      >
        <p>Are you sure you want to delete this discount?</p>
      </Modal>
    </>
  );
};

export default ViewAllDiscounts;
