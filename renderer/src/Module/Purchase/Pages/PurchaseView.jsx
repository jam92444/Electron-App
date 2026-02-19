import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPurchaseById } from "../Services/purchaseService";
import { FaArrowLeft } from "react-icons/fa6";
import { ViewAllItems } from "../../Items/Routers/items.lazyimports";

const PurchaseView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);

  useEffect(() => {
    getPurchaseById(id).then((res) => {
      if (res?.success) setPurchase(res);
    });
  }, [id]);

  if (!purchase) return null;

  return (
    <div className="p-6 space-y-4 bg-gray-50 min-h-screen">
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate("/purchase")}
      >
        <FaArrowLeft />
        Back
      </div>
      <div className="bg-white p-6 rounded-xl">
        <h2 className="text-lg font-semibold mb-3">Purchase Summary</h2>

        <div className="grid sm:grid-cols-4 gap-4 text-sm">
          {/* <div>
            <p className="text-gray-500">ID</p>
            <p>{purchase.purchase.id}</p>
          </div> */}
          <div>
            <p className="text-gray-500">Date</p>
            <p>{purchase.purchase.purchaseDate}</p>
          </div>
          <div>
            <p className="text-gray-500">Vendor</p>
            <p>{purchase.purchase.vendorName}</p>
          </div>
          <div>
            <p className="text-gray-500">Remarks</p>
            <p>{purchase.purchase.remarks || "-"}</p>
          </div>
        </div>
      </div>

      <ViewAllItems items={purchase.items} mode="PURCHASE" readOnly />
    </div>
  );
};

export default PurchaseView;
