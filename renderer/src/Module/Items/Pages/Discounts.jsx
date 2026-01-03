/* eslint-disable react-hooks/set-state-in-effect */
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
        title: "Missing Information",
        message: "Please fill all required fields.",
      });
      return false;
    }

    if (percentage <= 0 || percentage > 100) {
      setModal({
        title: "Invalid Discount",
        message: "Discount must be between 1% and 100%.",
      });
      return false;
    }

    if (new Date(discountObj.endDate) < new Date(discountObj.startDate)) {
      setModal({
        title: "Invalid Date Range",
        message: "End date cannot be earlier than start date.",
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
      return (
        d.type === discountToSave.type &&
        discountToSave.startDate <= d.endDate &&
        discountToSave.endDate >= d.startDate
      );
    });

    if (duplicate) {
      setModal({
        title: "Overlap Detected",
        message:
          "A discount of this type already exists for the selected date range.",
      });
    } else {
      const updated = [...discounts];
      editIndex !== null
        ? (updated[editIndex] = discountToSave)
        : updated.push(discountToSave);
      setDiscounts(updated);
      setEditIndex(null);
      setEditDiscount(null);
    }

    setConfirm(false);
    setDiscountToSave(null);
  };

  return (
    <div className="min-h-[80vh] bg-gray-50 p-4 sm:p-6">
      {/* -------- HEADER -------- */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          Discount Management
        </h1>
        <p className="text-sm text-gray-600">
          Manage seasonal, coupon and promotional discounts
        </p>
      </div>

      {/* -------- FORM CARD -------- */}
      <div className="bg-white rounded-xl border shadow-sm p-6 mb-8">
        <h2 className="text-md font-semibold text-gray-800 mb-4">
          {editIndex !== null ? "Edit Discount" : "Add New Discount"}
        </h2>

        <AddDiscountForm
          initialDiscount={editDiscount}
          onSave={handleSaveClick}
          onCancel={() => {
            setEditIndex(null);
            setEditDiscount(null);
          }}
        />
      </div>

      {/* -------- TABLE CARD -------- */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h2 className="text-md font-semibold text-gray-800 mb-4">
          Active Discounts
        </h2>

        <ViewAllDiscounts
          discounts={discounts}
          setDiscounts={setDiscounts}
          onEdit={(i) => {
            setEditIndex(i);
            setEditDiscount(discounts[i]);
          }}
        />
      </div>

      {/* -------- MODALS -------- */}
      {confirm && (
        <Modal
          title="Confirm Save"
          message={`Are you sure you want to ${
            editIndex !== null ? "update" : "save"
          } this discount?`}
          onClose={() => setConfirm(false)}
          actions={
            <>
              <Button buttonName="Cancel" onClick={() => setConfirm(false)} />
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

export default Discounts;

// ----------- AddDiscountForm -----------
const AddDiscountForm = ({ initialDiscount, onSave, onCancel }) => {
  const [discount, setDiscount] = useState({
    type: "",
    startDate: "",
    endDate: "",
    percentage: "",
  });

  useEffect(() => {
    setDiscount(
      initialDiscount || {
        type: "",
        startDate: "",
        endDate: "",
        percentage: "",
      }
    );
  }, [initialDiscount]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(discount);
    if (!initialDiscount) {
      setDiscount({ type: "", startDate: "", endDate: "", percentage: "" });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="text-xs text-gray-600">Discount Type</label>
          <select
            className="w-full border px-3 py-2 rounded-md mt-1 text-sm"
            value={discount.type}
            onChange={(e) =>
              setDiscount({ ...discount, type: e.target.value })
            }
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
          label="Discount (%)"
          type="number"
          placeholder="Eg: 10"
          value={discount.percentage}
          onChange={(e) =>
            setDiscount({ ...discount, percentage: e.target.value })
          }
        />
      </div>

      <div className="mt-6 flex justify-end gap-3">
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
    <>
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
              <Button buttonName="Cancel" onClick={() => setConfirmDelete(null)} />
              <Button
                buttonName="Delete"
                buttonType="delete"
                onClick={deleteDiscount}
              />
            </>
          }
        />
      )}
    </>
  );
};
