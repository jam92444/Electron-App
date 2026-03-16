/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/immutability */
import { useEffect, useState } from "react";
import Button from "../../../components/ReuseComponents/Button";
import Modal from "../../../components/ReuseComponents/Modal";
import { useStateContext } from "../../../context/StateContext";
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseCategories,
} from "../Services/expense.services";
import AddExpenseForm from "./AddExpenseForm";
import ViewAllExpenses from "./Viewallexpenses";

const Expense = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editExpense, setEditExpense] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [modal, setModal] = useState(null);
  const [expenseToSave, setExpenseToSave] = useState(null);
  const [saving, setSaving] = useState(false);

  const { state } = useStateContext();
  const canCreate =
    state.user.permissions.includes("expense.create") ||
    state.user.permissions.includes("*.*");
  const canView =
    state.user.permissions.includes("expense.view") ||
    state.user.permissions.includes("*.*");
  const canUpdate =
    state.user.permissions.includes("expense.update") ||
    state.user.permissions.includes("*.*");
  const canDelete =
    state.user.permissions.includes("expense.delete") ||
    state.user.permissions.includes("*.*");

  useEffect(() => {
    if (canView) loadExpenses();
    loadCategories();
    window.scrollTo(0, 0);
  }, []);

  const loadExpenses = async () => {
    const res = await getExpenses();
    if (res.success) setExpenses(res.expenses);
  };

  const loadCategories = async () => {
    const res = await getExpenseCategories();
    if (res.success) setCategories(res.categories);
  };

  /* ── Validation ── */
  const validateExpense = (e) => {
    if (!e.category_id) {
      setModal({
        title: "Missing Category",
        message: "Please select a category.",
      });
      return false;
    }
    const amount = parseFloat(e.amount);
    if (!e.amount || isNaN(amount) || amount <= 0) {
      setModal({
        title: "Invalid Amount",
        message: "Amount must be greater than zero.",
      });
      return false;
    }
    if (!e.expense_date) {
      setModal({
        title: "Missing Date",
        message: "Please select an expense date.",
      });
      return false;
    }
    return true;
  };

  /* ── Save flow ── */
  const handleSaveClick = (expense) => {
    const isCreating = !editExpense?.id;
    if (isCreating && !canCreate) {
      setModal({
        title: "Access Denied",
        message: "You do not have permission to create expenses.",
      });
      return;
    }
    if (!isCreating && !canUpdate) {
      setModal({
        title: "Access Denied",
        message: "You do not have permission to update expenses.",
      });
      return;
    }
    if (!validateExpense(expense)) return;

    setExpenseToSave({ ...expense, amount: parseFloat(expense.amount) });
    setConfirm(true);
  };

  const handleConfirmSave = async () => {
    setSaving(true);
    try {
      let res;
      if (editExpense?.id) {
        res = await updateExpense({ ...expenseToSave, id: editExpense.id });
      } else {
        res = await createExpense(expenseToSave);
      }

      if (!res.success) {
        setModal({
          title: "Error",
          message: res.error || "Failed to save expense.",
        });
      } else {
        await loadExpenses();
        setEditExpense(null);
      }
    } catch {
      setModal({ title: "Error", message: "Failed to save expense." });
    } finally {
      setSaving(false);
      setConfirm(false);
      setExpenseToSave(null);
    }
  };

  /* ── Delete flow ── */
  const handleDeleteClick = (expense) => {
    if (!canDelete) {
      setModal({
        title: "Access Denied",
        message: "You do not have permission to delete expenses.",
      });
      return;
    }
    setConfirmDelete(expense);
  };

  const handleConfirmDelete = async () => {
    try {
      const res = await deleteExpense(confirmDelete.id);
      if (!res.success) {
        setModal({
          title: "Error",
          message: res.error || "Failed to delete expense.",
        });
      } else {
        await loadExpenses();
      }
    } catch {
      setModal({ title: "Error", message: "Failed to delete expense." });
    } finally {
      setConfirmDelete(null);
    }
  };

  /* ── Edit ── */
  const handleEditClick = (expense) => {
    if (!canUpdate) {
      setModal({
        title: "Access Denied",
        message: "You do not have permission to update expenses.",
      });
      return;
    }
    setEditExpense(expense);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div aria-hidden="false" className="min-h-[80vh] bg-gray-50 p-4 sm:p-6">
      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Expense Management</h1>
        <p className="text-sm text-gray-600 italic">
          Track and manage daily business expenses
        </p>
      </div>

      {/* ── Form Card ── */}
      {(canCreate || canUpdate) && (
        <div className="bg-white rounded-xl border shadow-sm p-6 mb-8">
          <h2 className="text-md font-semibold mb-4">
            {editExpense ? "Edit Expense" : "Add New Expense"}
          </h2>
          {editExpense && (
            <span className="inline-block mb-3 text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">
              Editing Mode
            </span>
          )}
          <AddExpenseForm
            initialExpense={editExpense}
            categories={categories}
            onSave={handleSaveClick}
            onCancel={() => setEditExpense(null)}
            isEdit={!!editExpense}
            disabled={saving}
            onCategoryAdded={loadCategories}
          />
        </div>
      )}

      {/* ── Table Card ── */}
      {canView && (
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="text-md font-semibold mb-4">All Expenses</h2>
          <ViewAllExpenses
            expenses={expenses}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            canUpdate={canUpdate}
            canDelete={canDelete}
          />
        </div>
      )}

      {/* ── Confirm Save Modal ── */}
      {confirm && (
        <Modal
          title="Confirm Save"
          message="Are you sure you want to save this expense?"
          onClose={() => setConfirm(false)}
          actions={
            <>
              <Button buttonName="Cancel" onClick={() => setConfirm(false)} />
              <Button
                buttonName="Confirm"
                buttonType="save"
                onClick={handleConfirmSave}
                disabled={saving}
              />
            </>
          }
        />
      )}

      {/* ── Confirm Delete Modal ── */}
      {confirmDelete && (
        <Modal
          title="Confirm Delete"
          message={`Are you sure you want to delete this expense of ₹${confirmDelete.amount}?`}
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
                onClick={handleConfirmDelete}
              />
            </>
          }
        />
      )}

      {/* ── Alert Modal ── */}
      {modal && <Modal {...modal} onClose={() => setModal(null)} />}
    </div>
  );
};

export default Expense;
