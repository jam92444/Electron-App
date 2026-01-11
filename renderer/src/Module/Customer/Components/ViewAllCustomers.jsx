import { useState } from "react";
import Button from "../../../components/ReuseComponents/Button";
import Modal from "../../../components/ReuseComponents/Modal";
import DataTable from "../../../components/ReuseComponents/DataTable";
import { deleteCustomer } from "../Services/customer.services";

const ViewAllCustomers = ({ customers, onEdit, reload }) => {
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleDelete = async () => {
    if (!confirmDelete) return;

    await deleteCustomer(confirmDelete.id);
    setConfirmDelete(null);
    reload();
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
        onEdit={(i) => onEdit(i)}
        onDelete={(i) => setConfirmDelete(customers[i])}
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
    </>
  );
};

export default ViewAllCustomers;
