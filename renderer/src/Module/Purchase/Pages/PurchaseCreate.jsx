import { useEffect, useState } from "react";
import Select from "react-select";
import toast from "react-hot-toast";

import Input from "../../../components/ReuseComponents/Input";
import Button from "../../../components/ReuseComponents/Button";

import { getVendors } from "../../Vendor/Services/vendors";
import {
  createPurchase,
  insertPurchaseItem,
} from "../Services/purchaseService";

import { units } from "../../../Utils/data";
import { useNavigate } from "react-router-dom";
import {
  AddItemForm,
  ViewAllItems,
} from "../../Items/Routers/items.lazyimports";

const PurchaseCreate = () => {
  const navigate = useNavigate();
  const [purchaseId, setPurchaseId] = useState(null);
  const [purchaseDate, setPurchaseDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [vendor, setVendor] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [items, setItems] = useState([]);

  useEffect(() => {
    getVendors().then((res) => res?.success && setVendors(res.data));
  }, []);

  const handleCreatePurchase = async () => {
    if (!purchaseDate || !vendor) {
      toast.error("Purchase date & vendor required");
      return;
    }

    const res = await createPurchase({
      purchaseDate,
      vendorId: vendor.value,
      remarks,
    });

    if (res?.success) {
      setPurchaseId(res.purchaseId);
      toast.success("Purchase created");
    }
  };

  const handleItemAdded = async (payload) => {
    console.log("Items Payload", payload);
    const res = await insertPurchaseItem(payload);
    if (!res?.success) return;

    const refresh = await insertPurchaseItem({
      purchaseId,
      fetchOnly: true,
    });

    if (refresh?.success) setItems(refresh.data);
  };

  const vendorOptions = vendors.map((v) => ({
    value: v.id,
    label: v.vendorName,
  }));

  return (
    <div className="p-6 space-y-4 bg-gray-50 min-h-screen">
      {!purchaseId && (
        <div className="bg-white p-6 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold">Create Purchase</h2>

          <div className="grid sm:grid-cols-3 gap-4">
            <Input
              type="date"
              label="Purchase Date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
            />

            <Select
              options={vendorOptions}
              value={vendor}
              onChange={setVendor}
              className="mt-4"
              placeholder="Select Vendor"
            />

            <Input
              label="Remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          <Button buttonName="Save & Continue" onClick={handleCreatePurchase} />
          <Button
            buttonName="Cancel"
            buttonType="cancel"
            onClick={() => navigate("/purchase")}
          />
        </div>
      )}

      {purchaseId && (
        <>
          <Button
            buttonType="save"
            buttonName={"Save & Update"}
            onClick={() => navigate("/purchase")}
          />
          <AddItemForm
            units={units}
            mode="PURCHASE"
            purchaseId={purchaseId}
            vendorId={vendor.value}
            purchaseDate={purchaseDate}
            onSave={handleItemAdded}
          />

          {items.length > 0 && <ViewAllItems items={items} mode="PURCHASE" />}
        </>
      )}
    </div>
  );
};

export default PurchaseCreate;
