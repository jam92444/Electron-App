const Basic44mmTemplate = ({ billItems, billSummary, companyDetails }) => {
  console.log("bill summary", billSummary);
  return (
    <div>
      {/* POS PRINT */}
      <div id="pos-receipt" className="hidden print:block p-4 text-xs">
        <div id="pos-receipt" className="hidden print:block p-4 text-xs">
          <p className="flex items-start flex-col text-center text-[8px]">
            Bill No:- {billSummary?.invoice_number}
          </p>

          <h2 className="text-center font-bold">
            {companyDetails?.companyName || "Your Store Name"}
          </h2>

          <p className="text-center text-[8px] -mt-2">
            {companyDetails?.fullAddress
              ? `${companyDetails.fullAddress}, ${companyDetails?.city}, ${companyDetails?.pinCode}`
              : "Your Address"}
          </p>
          {companyDetails?.website && (
            <p className="text-center text-[7px] -mt-2">
              Visit :- {companyDetails.website}
            </p>
          )}

          <p className="flex items-start flex-col text-center text-[8px]">
            GST:- {companyDetails?.gstTin || "Your GST TIN No."}
          </p>
          {billSummary?.customer_name !== null && (
            <p className="flex items-start flex-col text-center text-[8px] -mt-1">
              Customer: {billSummary?.customer_name} , (
              {billSummary?.customer_phone})
            </p>
          )}
          <div className="flex justify-between mb-2">
            <span className="text-[8px]">
              Date:
              {new Date().toLocaleString("en-IN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </span>
            <span className="text-[8px]">
              Time:
              {new Date().toLocaleString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </div>

          <div className="text-nowrap overflow-x-hidden -mb-1">
            ----------------------------------------------------------------------------------------------
          </div>
          <div className="grid grid-cols-4 text-start text-[9px]">
            <span className="w-full text-wrap col-span-2">Item</span>
            <span>Size</span> <span>Price</span>
          </div>
          <div className="text-nowrap overflow-x-hidden -mt-1">
            ----------------------------------------------------------------------------------------------
          </div>
          {/* Items */}
          {billItems.map((item, index) => (
            <div key={index} className="grid grid-cols-4 text-start text-[8px]">
              <p className="w-full flex flex-col text-wrap col-span-2">
                <span>
                  {item.itemCode} x {item.quantity}
                </span>
                <span className="text-wrap text-[6px] -mt-1">
                  ( {item.itemName} )
                </span>
              </p>
              <span className="">{item.size ? item.size : "-"}</span>
              <span>₹{Number(item.totalAmount || 0).toFixed(2)}</span>
            </div>
          ))}
          <div className="text-nowrap overflow-x-hidden -mb-1">
            ----------------------------------------------------------------------------------------------
          </div>
          <div className="grid grid-cols-4 text-start text-[9px] font-semibold">
            <span className="w-full text-wrap col-span-2">Total:</span>
            <span className=""></span>
            <span className="">
              ₹{Number(billSummary.total_before_discount || 0).toFixed(2)}
            </span>
          </div>
          <div className="text-nowrap overflow-x-hidden -mt-1">
            ----------------------------------------------------------------------------------------------
          </div>
          <div className="grid grid-cols-3 text-end text-[8px] mt-3 font-semibold">
            <span className="w-full"></span>
            <span>Total Pcs:</span>
            <span>{billSummary.total_pieces || 0} pcs</span>
          </div>
          {billSummary.discount_amount > 0 &&
            billSummary.discount_amount !== null && (
              <div className="grid grid-cols-3 text-end text-[8px] font-semibold">
                <span className="w-full text-wrap "></span>
                <span className="">You save</span>
                <span>₹{(billSummary.discount_amount || 0).toFixed(2)}</span>
              </div>
            )}
          <div className="grid grid-cols-3 text-end text-[8px] font-semibold">
            <span className="w-full text-wrap "></span>
            <span className="">Grand Total:</span>
            <span>₹{(billSummary.total_after_discount || 0).toFixed(2)}</span>
          </div>
          {(companyDetails?.contactNumber ||
            companyDetails?.supportContact) && (
            <p className="text-center text-[7px] mt-2">
              Ph:-
              {companyDetails?.contactNumber
                ? companyDetails.contactNumber + ", "
                : ""}
              {companyDetails?.supportContact || ""}
            </p>
          )}

          {companyDetails?.termsConditions && (
            <p className="text-center text-[7px] -mt-1">
              Note :- {companyDetails.termsConditions}
            </p>
          )}

          <div className="text-center mt-1 text-[9px]">
            <p>----- Thank you for shopping ! -----</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Basic44mmTemplate;
