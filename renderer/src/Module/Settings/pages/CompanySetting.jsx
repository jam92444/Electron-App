import { CiEdit, CiSaveDown1 } from "react-icons/ci";
import { useEffect, useState } from "react";
import * as yup from "yup";
import Input from "../../../components/ReuseComponents/Input";
import Textarea from "../../../components/ReuseComponents/TextArea";
import Modal from "../../../components/ReuseComponents/Modal";
import Button from "../../../components/ReuseComponents/Button";
import { Country, State, City } from "country-state-city";

// ---------------- Editable Field ----------------
const EditableField = ({
  label,
  value,
  onChange,
  isEditing,
  type = "text",
  inputType = "input",
  error,
  maxLength,
  options = [],
}) => {
  const id = label.toLowerCase().replace(/\s+/g, "-");

  if (!isEditing) {
    return (
      <div>
        <p className="mt-2 text-xs text-gray-700 select-none">{label}</p>
        <p className="text-sm sm:text-base">{value || "NA"}</p>
      </div>
    );
  }

  return (
    <div>
      {inputType === "select" ? (
        <>
          <label className="text-xs text-gray-700">{label}</label>
          <select
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="border rounded w-full p-2 text-sm"
          >
            <option value="">Select {label}</option>
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </>
      ) : inputType === "textarea" ? (
        <Textarea
          label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
        />
      ) : (
        <Input
          label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          type={type}
          maxLength={maxLength}
        />
      )}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
};

// ---------------- Validation ----------------
const companySchema = yup.object().shape({
  companyName: yup.string().required("Company Name is required"),
  gstTin: yup.string().required("GST TIN is required"),
  contactNumber: yup
    .string()
    .matches(/^[0-9]{10}$/, "Contact Number must be 10 digits")
    .required(),
  companyEmail: yup.string().email().required(),
});

const billingSchema = yup.object().shape({
  fullAddress: yup.string().required("Address is required"),
  country: yup.string().required("Country is required"),
  state: yup.string().required("State is required"),
  city: yup.string().required("City is required"),
  pinCode: yup
    .string()
    .matches(/^\d{6}$/, "Pin Code must be 6 digits")
    .required(),
});

// ---------------- Main Wrapper ----------------
const CompanySetting = () => (
  <div className="w-full min-h-screen p-2 sm:p-4">
    <h1 className="text-xl font-semibold uppercase mb-4">Company Settings</h1>
    <div className="flex flex-col gap-4">
      <CompanyDetails />
      <BillingDetails />
      <OtherDetails />
    </div>
  </div>
);

// ---------------- Company Details ----------------
const CompanyDetails = () => {
  const [editMode, setEditMode] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    companyName: "",
    gstTin: "",
    contactNumber: "",
    companyEmail: "",
  });

  const handleSave = async () => {
    try {
      await companySchema.validate(formData, { abortEarly: false });
      setConfirm(true);
    } catch (err) {
      const e = {};
      err.inner.forEach((i) => (e[i.path] = i.message));
      setErrors(e);
    }
  };

  return (
    <section className="bg-white p-4 rounded shadow border">
      <div className="flex justify-between mb-2">
        <h2 className="font-semibold">Company Details</h2>
        {editMode ? (
          <div className="flex gap-2">
            <button
              className="border px-2 py-1 rounded text-sm bg-blue-500 text-white hover:scale-105 transition-all duration-100 hover:shadow-sm"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              className="border px-2 py-1 rounded text-sm bg-red-500 text-white hover:scale-105 transition-all duration-100 hover:shadow-sm"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            className="border px-2 py-1 rounded text-sm bg-green-500 text-white hover:scale-105 transition-all duration-100 hover:shadow-sm"
            onClick={() => setEditMode(true)}
          >
            Edit
          </button>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <EditableField
          label="Company Name"
          value={formData.companyName}
          onChange={(v) => setFormData({ ...formData, companyName: v })}
          isEditing={editMode}
          error={errors.companyName}
        />

        <EditableField
          label="GST TIN"
          value={formData.gstTin}
          onChange={(v) => setFormData({ ...formData, gstTin: v })}
          isEditing={editMode}
          error={errors.gstTin}
        />

        <EditableField
          label="Contact Number"
          maxLength={10}
          value={formData.contactNumber}
          onChange={(v) => setFormData({ ...formData, contactNumber: v })}
          isEditing={editMode}
          error={errors.contactNumber}
        />

        <EditableField
          label="Company Email"
          type="email"
          value={formData.companyEmail}
          onChange={(v) => setFormData({ ...formData, companyEmail: v })}
          isEditing={editMode}
          error={errors.companyEmail}
        />
      </div>

      {confirm && (
        <Modal
          title="Saved"
          message="Company details saved successfully"
          onClose={() => {
            setConfirm(false);
            setEditMode(false);
          }}
          actions={<Button buttonName="OK" />}
        />
      )}
    </section>
  );
};

// ---------------- Billing Details (Country-State-City) ----------------
const BillingDetails = () => {
  const [editMode, setEditMode] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    fullAddress: "",
    country: "",
    state: "",
    city: "",
    pinCode: "",
  });

  const countries = Country.getAllCountries();
  const states = State.getStatesOfCountry(formData.country);
  const cities = City.getCitiesOfState(formData.country, formData.state);

  const handleChange = (field, value) => {
    setFormData((p) => ({
      ...p,
      [field]: value,
      ...(field === "country" && { state: "", city: "" }),
      ...(field === "state" && { city: "" }),
    }));
  };

  const handleSave = async () => {
    try {
      await billingSchema.validate(formData, { abortEarly: false });
      setConfirm(true);
    } catch (err) {
      const e = {};
      err.inner.forEach((i) => (e[i.path] = i.message));
      setErrors(e);
    }
  };

  return (
    <section className="bg-white p-4 rounded shadow border">
      <div className="flex justify-between mb-2">
        <h2 className="font-semibold">Billing Details</h2>
        {editMode ? (
          <div className="flex gap-2">
            <button
              className="border px-2 rounded text-sm bg-blue-500 text-white hover:scale-105 transition-all duration-100 hover:shadow-sm"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              className="border px-2 rounded text-sm bg-red-500 text-white hover:scale-105 transition-all duration-100 hover:shadow-sm"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            className="border px-2 rounded text-sm bg-green-500 text-white hover:scale-105 transition-all duration-100 hover:shadow-sm"
            onClick={() => setEditMode(true)}
          >
            Edit
          </button>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <EditableField
          label="Full Address"
          inputType="textarea"
          value={formData.fullAddress}
          onChange={(v) => handleChange("fullAddress", v)}
          isEditing={editMode}
          error={errors.fullAddress}
        />

        <EditableField
          label="Country"
          inputType="select"
          options={countries.map((c) => ({ value: c.isoCode, label: c.name }))}
          value={formData.country}
          onChange={(v) => handleChange("country", v)}
          isEditing={editMode}
          error={errors.country}
        />

        <EditableField
          label="State"
          inputType="select"
          options={states.map((s) => ({ value: s.isoCode, label: s.name }))}
          value={formData.state}
          onChange={(v) => handleChange("state", v)}
          isEditing={editMode}
          error={errors.state}
        />

        <EditableField
          label="City"
          inputType="select"
          options={cities.map((c) => ({ value: c.name, label: c.name }))}
          value={formData.city}
          onChange={(v) => handleChange("city", v)}
          isEditing={editMode}
          error={errors.city}
        />

        <EditableField
          label="Pin Code"
          maxLength={6}
          value={formData.pinCode}
          onChange={(v) => handleChange("pinCode", v)}
          isEditing={editMode}
          error={errors.pinCode}
        />
      </div>

      {confirm && (
        <Modal
          title="Saved"
          message="Billing details saved successfully"
          onClose={() => {
            setConfirm(false);
            setEditMode(false);
          }}
          actions={<Button buttonName="OK" />}
        />
      )}
    </section>
  );
};

// ---------------- Other Details (unchanged logic) ----------------
const OtherDetails = () => {
  const [editMode, setEditMode] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [title, setTitle] = useState("Confirm Save");
  const [confirmBtnName, setConfirmBtnName] = useState("Cancel");
  const [message, setMessage] = useState("");
  const [validData, setValidData] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    supportContact: "",
    website: "",
    termsConditions: "",
    invoicePrefix: "",
    enableInvoicePrefix: false,
  });

  const confirmSave = () => {
    // Actual saving logic here
    setEditMode(false);
    setMessage(`Other Details ${editMode ? "updated" : "saved"}!`);
    setConfirm(null); // Close modal
  };

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleToggleInvoicePrefix = () => {
    setFormData((prev) => ({
      ...prev,
      enableInvoicePrefix: !prev.enableInvoicePrefix,
      invoicePrefix: prev.enableInvoicePrefix ? "" : prev.invoicePrefix,
    }));
    setErrors((prev) => ({ ...prev, invoicePrefix: "" }));
  };

  const handleSave = () => {
    const regex =
      /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?$/;

    // Validation
    if (formData.supportContact && formData.supportContact.length != 10) {
      setTitle("Alert!");
      setMessage("Contact number must be 10 digit long.");
      setConfirm("true");
      setValidData(false);
      setConfirmBtnName("Okay");
      return;
    }

    if (formData.website && !regex.test(formData.website)) {
      setTitle("Alert!");
      setMessage("Enter a valid link");
      setConfirm("true");
      setValidData(false);
      setConfirmBtnName("Okay");
      return;
    }

    if (formData.enableInvoicePrefix && formData.invoicePrefix.length !== 4) {
      setTitle("Alert!");
      setMessage("Prefix must have 4 letters");
      setConfirm("true");
      setValidData(false);
      setConfirmBtnName("Okay");
      return;
    }

    // ✅ For valid data, show confirmation modal
    setTitle(`Confirm ${editMode ? "Update" : "Save"}`);
    setMessage(`Are you sure you want to ${editMode ? "Update" : "Save"}?`);
    setConfirmBtnName(editMode ? "Update" : "Save");
    setConfirm("true"); // Show modal
    setValidData(true); // Enable Save button in modal
  };

  useEffect(() => {
    console.log("formData changed:", formData);
  }, [formData]);

  return (
    <section
      aria-labelledby="other-details-heading"
      className="bg-white  p-2 sm:p-4 rounded-md shadow-lg border"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 id="other-details-heading" className=" font-semibold text-black ">
          Other Details
        </h2>

        {editMode ? (
          <div className="flex gap-2">
            <button
              className="border px-2 py-1 rounded text-sm bg-blue-500 text-white hover:scale-105 transition-all duration-100 hover:shadow-sm"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              className="border px-2 py-1 rounded text-sm bg-red-500 text-white hover:scale-105 transition-all duration-100 hover:shadow-sm"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            className="border px-2 py-1 rounded text-sm bg-green-500 text-white hover:scale-105 transition-all duration-100 hover:shadow-sm"
            onClick={() => setEditMode(true)}
          >
            Edit
          </button>
        )}
      </div>
      <div className="mt-4 flex w-full justify-between flex-row-reverse p-1 sm:p-4 gap-2 sm:gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 w-full text-sm sm:text-base">
          <EditableField
            label="Support Contact"
            value={formData.supportContact}
            onChange={(val) => handleChange("supportContact", val)}
            isEditing={editMode}
            type="text"
            maxLength={10}
            error={errors.supportContact}
          />

          <EditableField
            label="Website"
            value={formData.website}
            onChange={(val) => handleChange("website", val)}
            isEditing={editMode}
            type="url" // ✅ FIXED
            inputType="input" // ✅ FIXED
            error={errors.website}
          />

          <EditableField
            label="Terms & Conditions"
            value={formData.termsConditions}
            onChange={(val) => handleChange("termsConditions", val)}
            isEditing={editMode}
            inputType="textarea" // ✅ textarea version
            error={errors.termsConditions}
          />

          <fieldset className="mt-1 sm:mt-4 col-span-full flex items-center gap-2">
            <input
              type="checkbox"
              id="enable-invoice-prefix"
              checked={formData.enableInvoicePrefix}
              onChange={handleToggleInvoicePrefix}
              disabled={!editMode}
              className="cursor-pointer"
            />
            <label
              htmlFor="enable-invoice-prefix"
              className="text-xs sm:text-sm  select-none cursor-pointer"
            >
              Enable Invoice Prefix
            </label>
          </fieldset>

          {formData.enableInvoicePrefix && (
            <EditableField
              label="Invoice Prefix"
              value={formData.invoicePrefix}
              onChange={(val) => handleChange("invoicePrefix", val)}
              isEditing={editMode}
              maxLength={4}
              type="text"
              inputType="input"
              error={errors.invoicePrefix}
            />
          )}
        </div>
      </div>
      {confirm !== null && (
        <Modal
          title={title}
          message={message}
          onClose={() => setConfirm(null)}
          actions={
            <>
              {validData == true && (
                <Button
                  buttonName="Cancel"
                  buttonType="normal"
                  onClick={() => setConfirm(null)}
                />
              )}
              <Button
                buttonName={confirmBtnName}
                buttonType="normal"
                onClick={() => {
                  if (validData) confirmSave();
                  else setConfirm(null);
                }}
              />
            </>
          }
        />
      )}
    </section>
  );
};

export default CompanySetting;
