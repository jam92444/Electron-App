import { useEffect, useState } from "react";
import Input from "../../../components/ReuseComponents/Input";
import Button from "../../../components/ReuseComponents/Button";
import DataTable from "../../../components/ReuseComponents/DataTable";
import Modal from "../../../components/ReuseComponents/Modal";

// ----------- Main Component -----------
const Discounts = () => {
  const [discounts, setDiscounts] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editDiscount, setEditDiscount] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [modal, setModal] = useState(null);
  const [discountToSave, setDiscountToSave] = useState(null);

  useEffect(() => window.scrollTo(0, 0), []);

  const validateDiscount = (discountObj) => {
    const percentage = parseFloat(discountObj.percentage);

    if (
      !discountObj.type ||
      !discountObj.startDate ||
      !discountObj.endDate ||
      isNaN(percentage)
    ) {
      setModal({
        title: "Missing",
        message: "Please fill all required fields.",
      });
      return false;
    }

    if (percentage <= 0 || percentage > 100) {
      setModal({
        title: "Invalid",
        message: "Discount must be between 1-100%.",
      });
      return false;
    }

    const start = new Date(discountObj.startDate);
    const end = new Date(discountObj.endDate);
    if (end < start) {
      setModal({
        title: "Invalid Date",
        message: "End Date cannot be earlier than Start Date.",
      });
      return false;
    }

    return true;
  };

  const handleSaveClick = (discountObj) => {
    if (!validateDiscount(discountObj)) return;
    setDiscountToSave({
      ...discountObj,
      percentage: parseFloat(discountObj.percentage),
    });
    setConfirm(true);
  };

  const handleConfirmSave = () => {
    const duplicate = discounts.some((d, i) => {
      if (editIndex !== null && i === editIndex) return false;

      // Check if date ranges overlap for same type
      return (
        d.type === discountToSave.type &&
        discountToSave.startDate <= d.endDate &&
        discountToSave.endDate >= d.startDate
      );
    });

    if (duplicate) {
      setModal({
        title: "Alert",
        message:
          "Discount overlaps with an existing discount of the same type.",
      });
    } else {
      const updated = [...discounts];
      if (editIndex !== null) {
        updated[editIndex] = discountToSave;
      } else {
        updated.push(discountToSave);
      }
      setDiscounts(updated);
      setEditIndex(null);
      setEditDiscount(null);
    }
    setConfirm(false);
    setDiscountToSave(null);
  };

  return (
    <div className=" sm:p-4 rounded min-h-[80vh]">
      <h1 className="text-lg sm:text-xl px-4 sm:p-0 font-semibold uppercase text-gray-900  mb-4">
        {editIndex !== null ? "Edit Discount" : "Add New Discount"}
      </h1>

      <AddDiscountForm
        initialDiscount={editDiscount}
        onSave={handleSaveClick}
        onCancel={() => {
          setEditIndex(null);
          setEditDiscount(null);
        }}
      />

      <ViewAllDiscounts
        discounts={discounts}
        setDiscounts={setDiscounts}
        onEdit={(i) => {
          setEditIndex(i);
          setEditDiscount(discounts[i]);
        }}
      />

      {confirm && (
        <Modal
          title="Confirm Save"
          message={`Are you sure you want to ${
            editIndex !== null ? "Update" : "Save"
          } this discount?`}
          onClose={() => setConfirm(false)}
          actions={
            <>
              <Button
                buttonName="Cancel"
                buttonType="normal"
                onClick={() => setConfirm(false)}
              />
              <Button
                buttonName="Confirm"
                buttonType="save"
                onClick={handleConfirmSave}
              />
            </>
          }
        />
      )}

      {modal && <Modal {...modal} onClose={() => setModal(null)} />}
    </div>
  );
};

// ----------- AddDiscountForm -----------
const AddDiscountForm = ({ initialDiscount, onSave, onCancel }) => {
  const [discount, setDiscount] = useState({
    type: "",
    startDate: "",
    endDate: "",
    percentage: "",
  });

  useEffect(
    () =>
      setDiscount(
        initialDiscount || {
          type: "",
          startDate: "",
          endDate: "",
          percentage: "",
        }
      ),
    [initialDiscount]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(discount);
    if (!initialDiscount) {
      setDiscount({ type: "", startDate: "", endDate: "", percentage: "" });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-xl sm:border"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="hidden text-sm text-gray-700 ">
            Type
          </label>
          <select
            className="w-full border mt-4 px-2 py-2 rounded   text-sm"
            value={discount.type}
            onChange={(e) => setDiscount({ ...discount, type: e.target.value })}
          >
            <option value="">Select Type</option>
            <option value="Coupon">Coupon</option>
            <option value="Regular">Regular</option>
            <option value="Festival">Festival</option>
          </select>
        </div>

        <Input
          label="Start Date"
          type="date"
          value={discount.startDate}
          onChange={(e) =>
            setDiscount({ ...discount, startDate: e.target.value })
          }
        />

        <Input
          label="End Date"
          type="date"
          value={discount.endDate}
          onChange={(e) =>
            setDiscount({ ...discount, endDate: e.target.value })
          }
        />

        <Input
          label="Discount %"
          type="number"
          placeholder="Enter Discount Percentage"
          value={discount.percentage}
          onChange={(e) =>
            setDiscount({ ...discount, percentage: e.target.value })
          }
        />
      </div>

      <div className="mt-6 flex gap-4 justify-end">
        <Button
          buttonName={initialDiscount ? "Update Discount" : "Save Discount"}
          buttonType="save"
          type="submit"
        />
        {initialDiscount && (
          <Button
            buttonName="Cancel"
            buttonType="cancel"
            type="button"
            onClick={onCancel}
          />
        )}
      </div>
    </form>
  );
};

// ----------- ViewAllDiscounts -----------
const ViewAllDiscounts = ({ discounts, setDiscounts, onEdit }) => {
  const [confirmDelete, setConfirmDelete] = useState(null);

  const deleteDiscount = () => {
    setDiscounts((d) => d.filter((_, i) => i !== confirmDelete));
    setConfirmDelete(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl sm:border mt-4">
      <DataTable
        columns={[
          { key: "type", label: "Type" },
          { key: "startDate", label: "Start Date" },
          { key: "endDate", label: "End Date" },
          { key: "percentage", label: "Discount (%)" },
        ]}
        data={discounts}
        
        onEdit={onEdit}
        onDelete={(i) => setConfirmDelete(i)}
      />

      {confirmDelete !== null && (
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
                onClick={deleteDiscount}
              />
            </>
          }
        />
      )}
    </div>
  );
};

export default Discounts;
