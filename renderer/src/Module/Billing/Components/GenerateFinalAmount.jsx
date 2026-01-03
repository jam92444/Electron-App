import Button from "../../../components/ReuseComponents/Button";
import { discount as discountOptions } from "../../../Utils/data";

// -------------------- BILL SUMMARY COMPONENT --------------------
const GenerateFinalAmount = ({
  billSummary,
  setBillDiscount,
  onPrint,
  onSaveOnly,
  onRoundOff,
  onDeleteBill,
  setBillSummary,
}) => {
  return (
    <div className="mt-10 float-right mr-4 p-4 rounded-lg border shadow-xl bg-white w-full sm:w-[300px] mb-10">
      <h2 className="text-lg font-semibold mb-3">Bill Summary</h2>

      {/* PAYMENT MODE */}
      <p className="flex justify-between text-sm mb-1">
        <span>Payment Mode :</span>
        <select
          className="border px-2 py-1 rounded text-sm"
          value={billSummary?.payment_mode || "Cash"}
          onChange={(e) =>
            setBillSummary({
              ...billSummary,
              payment_mode: e.target.value,
            })
          }
        >
          <option value="Cash">Cash</option>
          <option value="Online">Online</option>
        </select>
      </p>

      {/* DISCOUNT */}
      <div className="flex justify-between text-sm mb-1">
        <span>Discount :</span>
        <select
          className="border px-2 py-1 rounded text-sm"
          value={billSummary?.discount || 0}
          onChange={(e) => setBillDiscount(Number(e.target.value))}
        >
          {discountOptions.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      {/* TOTAL PIECES */}
      <p className="flex justify-between text-sm mb-1">
        <span>No. of PCS :</span>
        <span>{billSummary?.totalPieces || 0}</span>
      </p>

      {/* SAVINGS */}
      {billSummary?.discountAmount > 0 && (
        <p className="flex justify-between text-sm mb-1">
          <span>Amount You Saved :</span>
          <span className="text-green-600 font-semibold">
            ₹{billSummary.discountAmount.toFixed(2)}
          </span>
        </p>
      )}

      {/* TOTAL AMOUNT */}
      <p className="flex justify-between text-sm mt-3 font-semibold">
        <span>Total Amount :</span>
        <span className="text-blue-700">
          ₹{(billSummary?.totalAfterDiscount || 0).toFixed(2)}
        </span>
      </p>

      {/* BUTTONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-2 mt-3">
        <Button
          classname="rounded-md shadow-md hover:scale-95 hover:shadow-sm transition-all duration-150"
          buttonName={"Print Bill"}
          buttonType="save"
          onClick={onPrint}
        />
        <Button
          buttonName={"Round off"}
          buttonType="save"
          onClick={onRoundOff}
        />
        <Button
          classname="rounded-md shadow-md hover:scale-95 hover:shadow-sm transition-all duration-150"
          buttonName={"Save Only"}
          buttonType="save"
          onClick={onSaveOnly}
        />
        <Button
          classname="rounded-md shadow-md hover:scale-95 hover:shadow-sm transition-all duration-150"
          buttonName={"Delete Bill"}
          buttonType="delete"
          onClick={onDeleteBill}
        />
      </div>
    </div>
  );
};

export default GenerateFinalAmount;
