import { FaPen, FaTrashCan } from "react-icons/fa6";
import { Space, Tag } from "antd";

const ViewAllExpenses = ({
  expenses,
  onEdit,
  onDelete,
  canUpdate,
  canDelete,
}) => {
  const totalAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <>
      {/* ── Summary strip ── */}
      {expenses.length > 0 && (
        <div className="flex items-center gap-6 mb-4 p-3 bg-orange-50 border border-orange-100 rounded-lg text-sm">
          <span className="text-gray-600">
            Total entries: <strong>{expenses.length}</strong>
          </span>
          <span className="text-gray-600">
            Total amount:{" "}
            <strong className="text-orange-600">
              ₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </strong>
          </span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-orange-100">
            <tr className="text-gray-700">
              <th className="border px-3 py-2 text-left">#</th>
              <th className="border px-3 py-2 text-left">Category</th>
              <th className="border px-3 py-2 text-left">Amount (₹)</th>
              <th className="border px-3 py-2 text-left">Description</th>
              <th className="border px-3 py-2 text-left">Date</th>
              <th className="border px-3 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-400">
                  <p className="text-2xl mb-1">💸</p>
                  <p>No expenses found</p>
                </td>
              </tr>
            ) : (
              expenses.map((expense, idx) => (
                <tr
                  key={expense.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="border px-3 py-2 text-gray-500">{idx + 1}</td>
                  <td className="border px-3 py-2">
                    <Tag color={expense.is_default ? "orange" : "blue"}>
                      {expense.category_name}
                    </Tag>
                  </td>
                  <td className="border px-3 py-2 font-medium text-gray-800">
                    ₹{Number(expense.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="border px-3 py-2 text-gray-600">
                    {expense.description || <span className="text-gray-300">—</span>}
                  </td>
                  <td className="border px-3 py-2 text-gray-600">
                    {expense.expense_date}
                  </td>
                  <td className="border px-3 py-2 text-center">
                    <Space>
                      <span
                        title={canUpdate ? "Edit" : "No permission"}
                        className={
                          canUpdate
                            ? "text-blue-600 cursor-pointer hover:text-blue-800"
                            : "text-gray-300 cursor-not-allowed"
                        }
                        onClick={() => onEdit(expense)}
                      >
                        <FaPen />
                      </span>
                      <span
                        title={canDelete ? "Delete" : "No permission"}
                        className={
                          canDelete
                            ? "text-red-500 cursor-pointer hover:text-red-700"
                            : "text-gray-300 cursor-not-allowed"
                        }
                        onClick={() => onDelete(expense)}
                      >
                        <FaTrashCan />
                      </span>
                    </Space>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ViewAllExpenses;