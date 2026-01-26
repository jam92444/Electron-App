/* eslint-disable no-undef */
import { useEffect, useState } from "react";
import Input from "../../../components/ReuseComponents/Input";
import Button from "../../../components/ReuseComponents/Button";
import Select from "react-select";
import { getVendors } from "../../Vendor/Services/vendors";
import {
  createPurchase,
  insertPurchaseItem,
} from "../Services/purchaseService";
import { useStateContext } from "../../../context/StateContext";
import {
  RESET_PURCHASE,
  SET_PURCHASE,
} from "../../../context/reducer/actionTypes";
import toast from "react-hot-toast";
import { units } from "../../../Utils/data";
import AddItemForm from "../../Items/Components/AddItemForm";
import ViewAllItems from "../../Items/Components/ViewAllItems";
import { FaArrowLeft } from "react-icons/fa6";
import Modal from "../../../components/ReuseComponents/Modal";
import PurchasesListTable from "../Components/PurchaseListTable";

/* ---- PURCHASE ORDER PAGE ---- */
const PurchaseOrder = () => {
  const [activePage, setActivePage] = useState("LIST");
  const { dispatch } = useStateContext();

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Purchase Management</h1>
        <p className="text-sm text-gray-600 italic">
          Manage and track purchase orders with complete control.
        </p>
      </div>

      {activePage === "SUMMARY" && (
        <p
          className="flex gap-2 ml-2 cursor-pointer bg-white border hover:bg-slate-200 w-fit px-3 py-1 rounded-lg hover:scale-105 transition-shadow"
          onClick={() => setActivePage("LIST")}
        >
          <FaArrowLeft /> Back
        </p>
      )}

      {activePage === "LIST" && (
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="flex justify-between items-center mb-2 p-4">
            <h2 className="text-xl font-semibold ">Purchases</h2>
            <Button
              buttonName="+ New Purchase Order"
              classname=""
              onClick={() => {
                setActivePage("SUMMARY");
                dispatch({ type: RESET_PURCHASE });
              }}
            />
          </div>
          <PurchasesListTable />
        </div>
      )}

      {activePage === "SUMMARY" && <PurchaseOrderSummary />}
    </div>
  );
};

export default PurchaseOrder;

/* ----- PURCHASE ORDER DETAILS ----- */
const PurchaseOrderSummary = () => {
  const [purchaseDate, setPurchaseDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [vendorId, setVendorId] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [active, setActive] = useState("main");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const { state, dispatch } = useStateContext();
  const purchaseId = state.purchase?.currentPurchaseID;

  const vendorOptions = vendors.map((v) => ({
    value: v.id,
    label: v.vendorName,
  }));

  useEffect(() => {
    getVendors().then((res) => {
      if (res?.success) setVendors(res.data || []);
    });
  }, []);

  const handleCreatePurchase = async () => {
    if (!purchaseDate || !vendorId) {
      setModalMessage("Purchase date and vendor are required");
      setIsModalOpen(true);
      return;
    }

    setLoading(true);
    const res = await createPurchase({
      purchaseDate,
      vendorId: vendorId.value,
      remarks,
    });
    setLoading(false);
    setActive("items");

    if (res?.success) {
      dispatch({
        type: SET_PURCHASE,
        payload: res.purchaseId,
      });
    } else {
      setModalMessage(res?.error || "Failed to create purchase order");
      setIsModalOpen(true);
    }
  };

  return (
    <>
      {!purchaseId && active === "main" ? (
        <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold">Add Purchase Order</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              type="date"
              label="Purchase Date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
            />
            <div className="mt-4">
              <Select
                value={vendorId}
                onChange={setVendorId}
                options={vendorOptions}
                placeholder="Select Vendor"
                isSearchable
                isClearable
              />
            </div>
            <Input
              label="Remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <Button
              buttonName={loading ? "Saving..." : "Save & Continue"}
              onClick={handleCreatePurchase}
              disabled={loading}
            />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Purchase Order Summary</h2>
            <Button buttonName={"Save"} onClick={() => setActive("main")} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Purchase ID</p>
              <p className="font-medium">{purchaseId}</p>
            </div>
            <div>
              <p className="text-gray-500">Purchase Date</p>
              <p className="font-medium">{purchaseDate}</p>
            </div>
            <div>
              <p className="text-gray-500">Vendor</p>
              <p className="font-medium">{vendorId?.label}</p>
            </div>
            <div>
              <p className="text-gray-500">Remarks</p>
              <p className="font-medium">{remarks || "-"}</p>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- ADD ITEM ---------------- */}
      {purchaseId && active === "items" && (
        <AddPurchaseOrderItem
          purchaseId={purchaseId}
          vendorId={vendorId?.value}
          purchaseDate={purchaseDate}
          onItemAdded={(item) => setItems(item)}
        />
      )}

      {/* ---------------- ITEMS TABLE ---------------- */}
      {purchaseId && items.length > 0 && (
        <ViewAllItems
          items={items}
          onEdit={(index) => console.log("Edit item at index:", index)}
          mode="PURCHASE"
          reload={async () => {
            const res = await insertPurchaseItem({
              purchaseId,
              fetchOnly: true,
            });
            if (res?.success) setItems(res.data);
          }}
        />
      )}

      {/* ---------------- MODAL ---------------- */}
      {isModalOpen && (
        <Modal
          title="Notice"
          message={modalMessage}
          onClose={() => setIsModalOpen(false)}
          actions={
            <div className="flex gap-3 justify-end mt-2">
              <Button
                buttonName="OK"
                buttonType="save"
                onClick={() => setIsModalOpen(false)}
              />
            </div>
          }
        />
      )}
    </>
  );
};

/* ----- ADD PURCHASE ITEMS ----- */
const AddPurchaseOrderItem = ({
  purchaseId,
  vendorId,
  onItemAdded,
  purchaseDate,
}) => {
  const handleSave = async (payload) => {
    const res = await insertPurchaseItem(payload);
    if (!res.success && res.error === "ITEM_ID_EXISTS") {
      toast.error("ITEM ID already exist");
      return;
    }
    toast.success("Item added to purchase");
    onItemAdded(res.data);
  };

  const formattedDate = purchaseDate
    ? new Date(purchaseDate).toISOString().slice(0, 10)
    : "";

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Add Purchase Item</h2>
      <AddItemForm
        units={units}
        isEdit={false}
        mode="PURCHASE"
        purchaseId={purchaseId}
        vendorId={vendorId}
        purchaseDate={formattedDate}
        onSave={handleSave}
      />
    </div>
  );
};
