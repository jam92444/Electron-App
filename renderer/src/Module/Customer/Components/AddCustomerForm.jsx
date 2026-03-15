/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import Select from "react-select";
import Input from "../../../components/ReuseComponents/Input";
import Button from "../../../components/ReuseComponents/Button";

const today = new Date().toISOString().split("T")[0];
const nextYear = new Date(new Date().setFullYear(new Date().getFullYear() + 1))
  .toISOString()
  .split("T")[0];

const emptyCustomer = {
  name: "",
  phone: "",
  discountId: "",
  discountPercentage: 0,
  discountStartDate: today,
  discountEndDate: nextYear,
};

const AddCustomerForm = ({
  initialCustomer,
  discounts,
  onSave,
  onCancel,
  isEdit,
  disabled,
}) => {
  const [customer, setCustomer] = useState(emptyCustomer);

  useEffect(() => {
    if (initialCustomer) {
      setCustomer(initialCustomer);
    } else {
      setCustomer(emptyCustomer);
    }
  }, [initialCustomer]);

  // Convert discounts to React Select options
  const discountOptions = discounts.map((d) => ({
    value: d.id,
    label: `${d.name} (${d.percentage}%)`,
    data: d,
  }));

  const handleDiscountChange = (selectedOption) => {
    if (!selectedOption) {
      setCustomer({
        ...customer,
        discountId: "",
        discountPercentage: 0,
        discountStartDate: today,
        discountEndDate: nextYear,
      });
      return;
    }

    const d = selectedOption.data;
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + d.valid_days);

    setCustomer({
      ...customer,
      discountId: d.id,
      discountPercentage: d.percentage,
      discountStartDate: start.toISOString().split("T")[0],
      discountEndDate: end.toISOString().split("T")[0],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customer.name || !customer.phone) {
      alert("Name and phone are required!");
      return;
    }

    onSave(customer, isEdit);
    setCustomer(emptyCustomer);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          label="Customer Name"
          placeholder="Enter customer name"
          value={customer.name}
          onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
          disabled={disabled}
        />

        <Input
          label="Phone Number"
          placeholder="Enter phone number"
          value={customer.phone}
          onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
          disabled={disabled}
        />

        <div className="flex flex-col">
          <Select
            options={discountOptions}
            value={
              discountOptions.find((d) => d.value === customer.discountId) ||
              null
            }
            onChange={handleDiscountChange}
            isClearable
            placeholder="Select discount..."
            isDisabled={disabled}
            className="react-select-container mt-4"
            classNamePrefix="react-select"
          />
        </div>

        <Input
          label="Discount (%)"
          value={customer.discountPercentage}
          disabled
        />

        <Input
          label="Discount Start Date"
          type="date"
          value={customer.discountStartDate}
          onChange={(e) =>
            setCustomer({ ...customer, discountStartDate: e.target.value })
          }
          disabled={disabled}
        />

        <Input
          label="Discount End Date"
          type="date"
          value={customer.discountEndDate}
          onChange={(e) =>
            setCustomer({ ...customer, discountEndDate: e.target.value })
          }
          disabled={disabled}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button
          buttonName={isEdit ? "Update Customer" : "Save Customer"}
          buttonType="save"
          type="submit"
          disabled={disabled}
        />
        {isEdit && (
          <Button
            buttonName="Cancel"
            buttonType="cancel"
            onClick={onCancel}
            disabled={disabled}
          />
        )}
      </div>
    </form>
  );
};

export default AddCustomerForm;
