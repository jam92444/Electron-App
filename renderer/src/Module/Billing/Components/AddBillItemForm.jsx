import { useEffect, useState } from "react";
import { getItems } from "../../Items/Services/items";
import Select from "react-select"; // searchable select
import Input from "../../../components/ReuseComponents/Input";
import Button from "../../../components/ReuseComponents/Button";
// ----------- AddBillItemForm -----------
const AddBillItemForm = ({ initialItem, onSave, onCancel }) => {
  const [item, setItem] = useState({
    itemCode: "",
    itemName: "",
    price: "",
    size: "",
    quantity: "",
    totalAmount: 0,
  });
  const [AllItems, setAllItems] = useState([]);
  useEffect(() => {
       // eslint-disable-next-line react-hooks/set-state-in-effect
    if (initialItem) setItem(initialItem);
  }, [initialItem]);

  useEffect(() => {
    const price = parseFloat(item.price) || 0;
    const qty = parseFloat(item.quantity) || 0;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItem((prev) => ({ ...prev, totalAmount: price * qty }));
  }, [item.price, item.quantity]);

  const handleReset = () => {
    setItem({
      itemCode: "",
      itemName: "",
      price: "",
      size: "",
      quantity: "",
      totalAmount: 0,
    });
  };

  useEffect(() => {
    const fetchItems = async () => {
      const response = await getItems();
      if (!response.success) {
        setAllItems([
          {
            itemCode: "No Data found",
            itemName: "",
            price: "",
            size: "",
            quantity: "",
            totalAmount: 0,
          },
        ]);
      } else {
        console.log(response.items)
        setAllItems(response.items);
      }
    };
    fetchItems();
  }, []);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(item);
        if (!initialItem) handleReset();
      }}
      className="bg-white p-4 rounded mb-6 shadow-xl border"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Item Name */}
        <div className="mt-4">
          <Select
            options={AllItems.map((i) => ({
              label: i.itemName,
              value: i.itemName,
            }))}
            value={
              item.itemName
                ? { label: item.itemName, value: item.itemName }
                : null
            }
            className="text-sm rounded-full"
            onChange={(selected) => {
              const selectedItem = AllItems.find(
                (i) => i.itemName === selected.value
              );
              console.log(selectedItem)
              setItem({
                ...item,
                itemCode: selectedItem.itemID || "",
                itemName: selectedItem.itemName,
                price: selectedItem.hasVariants ? "" : selectedItem.sellingPrice,
                size: "",
              });
            }}
            placeholder="Select Item*"
            isSearchable
          />
        </div>

        {/* Item Code */}
        <Input
          label="Item Code"
          placeholder="Enter Item Code"
          value={item.itemCode}
          onChange={(e) => setItem({ ...item, itemCode: e.target.value })}
        />

        {/* Size (Variants) */}
        {item.itemName &&
          AllItems.find((i) => i.itemName === item.itemName)?.hasVariants && (
            <div className="mt-4">
              <Select
                className="text-sm"
                options={AllItems.find(
                  (i) => i.itemName === item.itemName
                ).variants.map((v) => ({ label: v.size, value: v.size }))}
                value={
                  item.size ? { label: item.size, value: item.size } : null
                }
                onChange={(selected) => {
                  const selectedSize = AllItems.find(
                    (i) => i.itemName === item.itemName
                  ).variants.find((v) => v.size === selected.value);
                  setItem({
                    ...item,
                    size: selectedSize.size,
                    price: selectedSize.sellingPrice,
                  });
                }}
                placeholder="Select Size*"
              />
            </div>
          )}

        {/* Price */}
        <Input
          label="Price *"
          type="number"
          placeholder="Enter Price"
          classname="select-none"
          value={item.price}
          onChange={(e) => setItem({ ...item, price: e.target.value })}
          disabled
        />

        {/* Quantity */}
        <Input
          label="Quantity *"
          type="number"
          placeholder="Enter Quantity"
          value={item.quantity}
          onChange={(e) => setItem({ ...item, quantity: e.target.value })}
        />

        {/* Total */}
        <Input
          label="Total Amount"
          type="number"
          value={item.totalAmount}
          readOnly
          disabled
        />
      </div>

      <div className="mt-4 flex gap-4 justify-end">
        <Button
          buttonName="Cancel"
          type="button"
          classname="shadow-md hover:scale-95 hover:shadow-sm transition-all duration-150"
          onClick={handleReset}
        />
        <Button
          buttonName={initialItem ? "Update" : "Add Item"}
          buttonType="save"
          classname="shadow-md hover:scale-95 hover:shadow-sm transition-all duration-150"
          type="submit"
        />
        {initialItem && (
          <Button
            buttonName="Cancel"
            buttonType="cancel"
            type="button"
            onClick={onCancel}
          />
        )}
      </div>
    </form>
  );
};

export default AddBillItemForm;
