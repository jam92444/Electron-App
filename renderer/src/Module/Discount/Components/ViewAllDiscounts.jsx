import { useState } from "react";
import Button from "../../../components/ReuseComponents/Button";
import DataTable from "../../../components/ReuseComponents/DataTable";
import Modal from "../../../components/ReuseComponents/Modal";
import { deleteDiscount } from "../Services/discount.services";

const ViewAllDiscounts = ({ discounts, onEdit, reload }) => {
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleDelete = async () => {
    await deleteDiscount(confirmDelete.id);
    setConfirmDelete(null);
    reload();
  };
  // console.log(discounts);
  return (
    <>
      <DataTable
        columns={[
          { key: "name", label: "Name" },
          { key: "percentage", label: "Discount (%)" },
          { key: "valid_days", label: "Valid Days" },
          {
            key: "is_active",
            label: "Status",
            render: (row) => (row.is_active == 1 ? "Active" : "Inactive"),
          },
        ]}
        data={discounts}
        onEdit={(i) => onEdit(discounts[i])}
        onDelete={(i) => setConfirmDelete(discounts[i])}
      />

      {confirmDelete && (
        <Modal
          title="Confirm Deletion"
          message="Are you sure you want to delete this discount?"
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

export default ViewAllDiscounts;
