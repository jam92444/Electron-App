/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import Button from "../../../components/ReuseComponents/Button";
import Input from "../../../components/ReuseComponents/Input";
import { createExpenseCategory } from "../Services/expense.services";

const today = new Date().toISOString().split("T")[0];

const emptyExpense = {
  category_id: "",
  amount: "",
  description: "",
  expense_date: today,
};

const AddExpenseForm = ({
  initialExpense,
  categories,
  onSave,
  onCancel,
  isEdit,
  disabled,
  onCategoryAdded,
}) => {
  const [form, setForm] = useState(emptyExpense);
  const [newCategory, setNewCategory] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  useEffect(() => {
    if (initialExpense) {
      setForm({
        category_id: initialExpense.category_id ?? "",
        amount: initialExpense.amount ?? "",
        description: initialExpense.description ?? "",
        expense_date: initialExpense.expense_date ?? today,
      });
    } else {
      setForm(emptyExpense);
    }
  }, [initialExpense]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form, isEdit);
    if (!isEdit) setForm(emptyExpense);
  };

  const handleAddCategory = async () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return setCategoryError("Category name cannot be empty.");
    setCategoryError("");
    setAddingCategory(true);
    try {
      const res = await createExpenseCategory(trimmed);
      if (!res.success) {
        setCategoryError(
          res.error === "CATEGORY_EXISTS"
            ? "Category already exists."
            : "Failed to add category."
        );
      } else {
        setNewCategory("");
        await onCategoryAdded();
      }
    } catch {
      setCategoryError("Failed to add category.");
    } finally {
      setAddingCategory(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Category */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Category *</label>
          <select
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            disabled={disabled}
            required
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            <option value="">Select category...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <Input
          label="Amount (₹) *"
          name="amount"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Enter amount"
          value={form.amount}
          onChange={handleChange}
          disabled={disabled}
        />

        {/* Date */}
        <Input
          label="Expense Date *"
          name="expense_date"
          type="date"
          value={form.expense_date}
          onChange={handleChange}
          disabled={disabled}
        />

        {/* Description */}
        <Input
          label="Description"
          name="description"
          placeholder="Optional note..."
          value={form.description}
          onChange={handleChange}
          disabled={disabled}
        />
      </div>

      {/* Add custom category inline */}
      <div className="flex items-end gap-2 pt-1">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Add custom category</label>
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="e.g. Maintenance"
            disabled={addingCategory || disabled}
            className="border rounded px-3 py-2 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          {categoryError && (
            <p className="text-xs text-red-500">{categoryError}</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleAddCategory}
          disabled={addingCategory || disabled || !newCategory.trim()}
          className="px-3 py-2 text-sm rounded bg-gray-100 border hover:bg-gray-200 disabled:opacity-40 transition-colors"
        >
          {addingCategory ? "Adding..." : "+ Add"}
        </button>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-1">
        <Button
          buttonName={isEdit ? "Update Expense" : "Save Expense"}
          buttonType="save"
          type="submit"
          disabled={disabled}
        />
        {isEdit && (
          <Button
            buttonName="Cancel"
            buttonType="cancel"
            type="button"
            onClick={onCancel}
            disabled={disabled}
          />
        )}
      </div>
    </form>
  );
};

export default AddExpenseForm;