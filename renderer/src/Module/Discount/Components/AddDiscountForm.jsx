/* eslint-disable react-hooks/set-state-in-effect */
import { useState } from "react";
import { useEffect } from "react";
import Input from "../../../components/ReuseComponents/Input";
import Button from "../../../components/ReuseComponents/Button";

const AddDiscountForm = ({ initialDiscount, onSave, onCancel }) => {
  const [discount, setDiscount] = useState({
    name: "",
    percentage: "",
    valid_days: "",
    is_active: true,
  });

  useEffect(() => {
    setDiscount(
      initialDiscount || {
        name: "",
        percentage: "",
        valid_days: "",
        is_active: true,
      }
    );
  }, [initialDiscount]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(discount);
    if (!initialDiscount) {
      setDiscount({ name: "", percentage: "", valid_days: "", is_active: true });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          label="Discount Name"
          value={discount.name}
          onChange={(e) => setDiscount({ ...discount, name: e.target.value })}
        />

        <Input
          label="Discount (%)"
          type="number"
          value={discount.percentage}
          onChange={(e) =>
            setDiscount({ ...discount, percentage: e.target.value })
          }
        />

        <Input
          label="Valid Days"
          type="number"
          value={discount.valid_days}
          onChange={(e) =>
            setDiscount({ ...discount, valid_days: e.target.value })
          }
        />

        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={discount.is_active}
              onChange={(e) =>
                setDiscount({ ...discount, is_active: e.target.checked })
              }
            />
            Active
          </label>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button
          buttonName={initialDiscount ? "Update Discount" : "Save Discount"}
          buttonType="save"
          type="submit"
        />
        {initialDiscount && (
          <Button buttonName="Cancel" buttonType="cancel" onClick={onCancel} />
        )}
      </div>
    </form>
  );
};


export default AddDiscountForm;