import { forwardRef } from "react";



const LabelPreview = forwardRef(({ data }, ref) => {
  return (
    <div
      ref={ref}
      style={{ border: "2px solid black", padding: 20, width: 300 }}
    >
      <h3>Product Label</h3>
      <p>Name: {data.productName || "-"}</p>
      <p>SKU: {data.sku || "-"}</p>
      <p>Weight: {data.weight || "-"}</p>
    </div>
  );
});

export default LabelPreview;

