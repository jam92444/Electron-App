/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/immutability */
import { useEffect, useState } from "react";
import Button from "../../../components/ReuseComponents/Button";
import Modal from "../../../components/ReuseComponents/Modal";
import {
  AddDiscountForm,
  ViewAllDiscounts,
} from "../Routes/discount.lazyimports";
import {
  getDiscounts,
  createDiscount,
  updateDiscount,
} from "../Services/discount.services";

const Discount = () => {
  const [discounts, setDiscounts] = useState([]);
  const [editDiscount, setEditDiscount] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [modal, setModal] = useState(null);
  const [discountToSave, setDiscountToSave] = useState(null);

  useEffect(() => {
    loadDiscounts();
    window.scrollTo(0, 0);
  }, []);

  const loadDiscounts = async () => {
    const res = await getDiscounts();
    if (res.success) setDiscounts(res.discounts);
  };

  const validateDiscount = (d) => {
    const percentage = parseFloat(d.percentage);
    const validDays = parseInt(d.valid_days, 10);

    if (!d.name || isNaN(percentage) || isNaN(validDays)) {
      setModal({
        title: "Missing Information",
        message: "Please fill all required fields.",
      });
      return false;
    }

    if (percentage <= 0 || percentage > 100) {
      setModal({
        title: "Invalid Discount",
        message: "Discount must be between 1 and 100.",
      });
      return false;
    }

    if (validDays <= 0) {
      setModal({
        title: "Invalid Valid Days",
        message: "Valid days must be greater than zero.",
      });
      return false;
    }

    return true;
  };

  const handleSaveClick = (discount) => {
    if (!validateDiscount(discount)) return;

    setDiscountToSave({
      ...discount,
      percentage: parseFloat(discount.percentage),
      valid_days: parseInt(discount.valid_days, 10),
      is_active: discount.is_active ? 1 : 0,
    });

    setConfirm(true);
  };

  const handleConfirmSave = async () => {
    try {
      if (editDiscount?.id) {
        await updateDiscount(editDiscount.id, discountToSave);
      } else {
        await createDiscount(discountToSave);
      }

      await loadDiscounts();
      setEditDiscount(null);
    } catch (err) {
      setModal({
        title: "Error",
        message: "Failed to save discount.",
      });
    }

    setConfirm(false);
    setDiscountToSave(null);
  };

  return (
    <div aria-hidden="false" className="min-h-[80vh] bg-gray-50 p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Discount Management</h1>
        <p className="text-sm text-gray-600">
          Manage percentage-based discounts
        </p>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-6 mb-8">
        <h2 className="text-md font-semibold mb-4">
          {editDiscount ? "Edit Discount" : "Add New Discount"}
        </h2>

        <AddDiscountForm
          initialDiscount={editDiscount}
          onSave={handleSaveClick}
          onCancel={() => setEditDiscount(null)}
        />
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h2 className="text-md font-semibold mb-4">All Discounts</h2>

        <ViewAllDiscounts
          discounts={discounts}
          onEdit={(discount) => setEditDiscount(discount)}
          reload={loadDiscounts}
        />
      </div>

      {confirm && (
        <Modal
          title="Confirm Save"
          message="Are you sure you want to save this discount?"
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

export default Discount;
