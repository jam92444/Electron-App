import GenerateFinalAmount from "./GenerateFinalAmount";
import { CiEdit, CiTrash } from "react-icons/ci";
// ----------- BillItemsTable -----------
const BillItemsTable = ({
  items,
  onEdit,
  onDelete,
  billSummary,
  setBillDiscount,
  onPrint,
  onDeleteBill,
  onSaveOnly,
  onRoundOff,
  setBillSummary
}) => {
  return (
    <div className="bg-white sm:p-4 p-2 rounded shadow-xl border h-auto">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse border border-gray-300 mt-2 rounded-lg shadow-md">
          <thead>
            <tr className="bg-orange-100 text-white text-sm">
              <th className="border p-2">Item Code</th>
              <th className="border p-2">Item Name*</th>
              <th className="border p-2">Price*</th>
              <th className="border p-2">Size*</th>
              <th className="border p-2">Quantity*</th>
              <th className="border p-2">Total Amount</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>

          <tbody className="text-sm text-gray-600">
            {items.length > 0 ? (
              items.map((it, idx) => (
                <tr key={idx}>
                  <td className="border p-2">{it.itemCode}</td>
                  <td className="border p-2">{it.itemName}</td>
                  <td className="border p-2">{it.price}</td>
                  <td className="border p-2">{it.size}</td>
                  <td className="border p-2">{it.quantity}</td>
                  <td className="border p-2">{it.totalAmount}</td>
                  <td className="p-2 flex gap-2">
                    <button
                      className="bg-green-400 rounded-full hover:scale-125 p-1 border"
                      onClick={() => onEdit(idx)}
                    >
                      <CiEdit size={18} color="black" />
                    </button>

                    <button
                      onClick={() => onDelete(idx)}
                      className="bg-red-400 rounded-full hover:scale-125 p-1 border"
                    >
                      <CiTrash color="black" size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="text-center">
                <td className="border px-2 py-1" colSpan={7}>
                  No items added
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <GenerateFinalAmount
        billSummary={billSummary}
        setBillDiscount={setBillDiscount}
        onPrint={onPrint}
        onSaveOnly={onSaveOnly}
        setBillSummary={setBillSummary}
        onDeleteBill={onDeleteBill}
        onRoundOff={onRoundOff}
      />
    </div>
  );
};

export default BillItemsTable;