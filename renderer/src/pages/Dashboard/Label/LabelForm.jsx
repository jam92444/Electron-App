import  { useState } from "react";


function LabelForm({ onChange }) {
  const [form, setForm] = useState({ productName: "", sku: "", weight: "" });
  const update = (e) => {
    const newForm = { ...form, [e.target.name]: e.target.value };
    setForm(newForm);
    onChange(newForm);
  };
  return (
    <div>
      
      <h2>Enter Label Info</h2>
      <input
        name="productName"
        placeholder="Product Name"
        value={form.productName}
        onChange={update}
      />
      <br />
      <input name="sku" placeholder="SKU" value={form.sku} onChange={update} />
      <br />
      <input
        name="weight"
        placeholder="Weight"
        value={form.weight}
        onChange={update}
      />
      <br />
    </div>
  );
}
export default LabelForm;
