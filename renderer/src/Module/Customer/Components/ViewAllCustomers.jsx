import { useState } from "react";
import Button from "../../../components/ReuseComponents/Button";
import Modal from "../../../components/ReuseComponents/Modal";
import DataTable from "../../../components/ReuseComponents/DataTable";
import { deleteCustomer } from "../Services/customer.services";

const ViewAllCustomers = ({
  customers,
  onEdit,
  reload,
  canUpdate,
  canDelete,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [accessModal, setAccessModal] = useState(null);

  const handleDelete = async () => {
    if (!confirmDelete) return;

    await deleteCustomer(confirmDelete.id);
    setConfirmDelete(null);
    reload();
  };

  const handleEditClick = (i) => {
    if (!canUpdate) {
      setAccessModal({
        title: "Access Denied",
        message: "You do not have permission to update customers.",
      });
      return;
    }
    onEdit(i);
  };

  const handleDeleteClick = (i) => {
    if (!canDelete) {
      setAccessModal({
        title: "Access Denied",
        message: "You do not have permission to delete customers.",
      });
      return;
    }
    setConfirmDelete(customers[i]);
  };

  return (
    <>
      <DataTable
        columns={[
          { key: "name", label: "Name" },
          { key: "phone", label: "Phone" },
          { key: "discountPercentage", label: "Discount (%)" },
          { key: "discountStartDate", label: "Start Date" },
          { key: "discountEndDate", label: "End Date" },
        ]}
        data={customers}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        canUpdate={canUpdate}
        canDelete={canDelete}
      />

      {confirmDelete && (
        <Modal
          title="Confirm Deletion"
          message={`Are you sure you want to delete customer "${confirmDelete.name}"?`}
          onClose={() => setConfirmDelete(null)}
          actions={
            <>
              <Button
                buttonName="Cancel"
                onClick={() => setConfirmDelete(null)}
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

      {accessModal && (
        <Modal
          title={accessModal.title}
          message={accessModal.message}
          onClose={() => setAccessModal(null)}
          actions={
            <Button
              buttonName="OK"
              buttonType="save"
              onClick={() => setAccessModal(null)}
            />
          }
        />
      )}
    </>
  );
};

export default ViewAllCustomers;
