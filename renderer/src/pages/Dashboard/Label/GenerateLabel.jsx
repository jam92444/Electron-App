import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import LabelPreview from "./LabelPreview";

export default function GenerateLabel() {
  const [labelData, setLabelData] = useState({
    productName: "",
    sku: "",
    weight: "",
  });

  const printRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: "Label",
    onBeforeGetContent: () => {
      if (!printRef.current) {
        console.warn("printRef is null!");
      }
    },
  });

  const handleChange = (e) => {
    setLabelData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen p-4">
      <h1>Label Generator</h1>

      <div className="mb-4">
        <input
          name="productName"
          placeholder="Product Name"
          value={labelData.productName}
          onChange={handleChange}
        />
        <br />
        <input name="sku" placeholder="SKU" value={labelData.sku} onChange={handleChange} />
        <br />
        <input
          name="weight"
          placeholder="Weight"
          value={labelData.weight}
          onChange={handleChange}
        />
      </div>

      {/* Preview component with ref forwarded */}
      <LabelPreview ref={printRef} data={labelData} />

      <button
        className="mt-4"
        onClick={handlePrint}
        disabled={!labelData.productName && !labelData.sku && !labelData.weight}
      >
        Print Label
      </button>
    </div>
  );
}
