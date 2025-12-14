import { CiEdit, CiSaveDown1 } from "react-icons/ci";
import { useState, useEffect } from "react";
import * as yup from "yup";
import asset from "../../../Utils/asset";
import Input from "../../../components/ReuseComponents/Input";
import Textarea from "../../../components/ReuseComponents/TextArea";
import Modal from "../../../components/ReuseComponents/Modal";
import Button from "../../../components/ReuseComponents/Button";

// EditableField: renders input or display with label & error
const EditableField = ({
  label,
  value,
  onChange,
  isEditing,
  type = "text",
  inputType = "input",
  error,
  maxLength,
  ...rest
}) => {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      {isEditing ? (
        <>
          {inputType === "input" ? (
            <Input
              id={id}
              label={label}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={`Enter ${label}`}
              type={type}
              maxLength={maxLength}
              classname="border max-w-[350px] text-sm sm:text-base"
              aria-describedby={error ? `${id}-error` : undefined}
              {...rest}
            />
          ) : (
            <Textarea
              id={id}
              label={label}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={`Enter ${label}`}
              rows={5}
              className="text-sm sm:text-base"
              aria-describedby={error ? `${id}-error` : undefined}
              {...rest}
            />
          )}
          {error && (
            <p
              id={`${id}-error`}
              role="alert"
              className="text-xs text-red-600 mt-1 select-none"
            >
              {error}
            </p>
          )}
        </>
      ) : (
        <>
          <p className="mt-2 text-xs text-gray-700  select-none">{label}</p>
          <p className=" text-sm sm:text-base">{value || "NA"}</p>
        </>
      )}
    </div>
  );
};

// Validation Schemas
const companySchema = yup.object().shape({
  companyName: yup.string().required("Company Name is required"),
  gstTin: yup.string().required("GST TIN is required"),
  contactNumber: yup
    .string()
    .matches(/^[0-9]{10}$/, "Contact Number must be 10 digits")
    .required("Contact Number is required"),
  companyEmail: yup
    .string()
    .email("Invalid email")
    .required("Email is required"),
});

const billingSchema = yup.object().shape({
  fullAddress: yup.string().required("Full Address is required"),
  pinCode: yup
    .string()
    .matches(/^\d{6}$/, "Pin Code must be 6 digits")
    .required("Pin Code is required"),
  city: yup.string().required("City is required"),
  state: yup.string().required("State is required"),
});

const CompanySetting = () => {
  return (
    <div className="  w-full min-h-screen rounded-md p-2 sm:p-4">
      <h1 className="text-md sm:text-xl  mb-2 select-none font-semibold uppercase ">
        Company Settings
      </h1>
      <div className="flex flex-col gap-2 sm:gap-4">
        <CompanyDetails />
        <BillingDetails />
        <OtherDetails />
      </div>
    </div>
  );
};
// --------------------Company Details---------------------------
const CompanyDetails = () => {
  const [editMode, setEditMode] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [title, setTitle] = useState("Confirm Save");
  const [message, setMessage] = useState("");
  const [confirmBtnName, setConfirmBtnName] = useState("Cancel");
  const [validData, setValidData] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    gstTin: "",
    contactNumber: "",
    companyEmail: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const confirmSave = () => {
    setEditMode(false);
    setMessage(`Company Details ${editMode ? "updated" : "saved"}!`);
    setConfirm(null);
  };

  const handleSave = async () => {
    try {
      await companySchema.validate(formData, { abortEarly: false });
      setErrors({});
      setTitle(`Confirm ${editMode ? "Update" : "Save"}`);
      setMessage(`Are you sure you want to ${editMode ? "Update" : "Save"}?`);
      setConfirmBtnName(editMode ? "Update" : "Save");
      setConfirm("true");
      setValidData(true);
    } catch (err) {
      if (err.inner) {
        const newErrors = {};
        err.inner.forEach(({ path, message }) => {
          newErrors[path] = message;
        });
        setErrors(newErrors);
      }
      setTitle("Alert!");
      setMessage("Please fix the highlighted errors before saving.");
      setConfirm("true");
      setValidData(false);
      setConfirmBtnName("Okay");
    }
  };

  return (
    <section className="bg-white  p-2 sm:p-4 rounded-md shadow-lg border">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base sm:text-lg font-semibold text-gray-700 ">
          Company Details
        </h2>

        {editMode ? (
          <div className="flex items-center gap-1">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 border rounded-2xl px-2 py-1 text-sm cursor-pointer bg-red-400 hover:text-white border-red-400"
            >
              <span>{editMode ? "Update" : "Save"}</span>
              <CiSaveDown1 />
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="flex items-center gap-2 border rounded-2xl px-2 py-1 text-sm cursor-pointer border-red-400 hover:bg-red-400 hover:text-white text-gray-700 "
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-2 border rounded-2xl px-2 py-1 text-sm cursor-pointer hover:bg-green-400 hover:text-white text-gray-700 "
          >
            <span>Edit</span>
            <CiEdit />
          </button>
        )}
      </div>

      <div className="mt-4 flex w-full justify-between flex-col sm:flex-row-reverse p-1 sm:p-4 gap-2 sm:gap-4">
        <div className="border border-gray-400 w-20 h-20 sm:w-40 content-center rounded-xl overflow-hidden p-1 sm:p-4">
          <img src={asset.logo} alt="Company Logo" className="object-cover" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 w-full text-sm">
          <EditableField
            label="Company Name"
            value={formData.companyName}
            onChange={(val) => handleChange("companyName", val)}
            isEditing={editMode}
            error={errors.companyName}
          />
          <EditableField
            label="GST TIN"
            value={formData.gstTin}
            onChange={(val) => handleChange("gstTin", val)}
            isEditing={editMode}
            error={errors.gstTin}
          />
          <EditableField
            label="Contact Number"
            value={formData.contactNumber}
            onChange={(val) => handleChange("contactNumber", val)}
            isEditing={editMode}
            maxLength={10}
            error={errors.contactNumber}
          />
          <EditableField
            label="Company Email"
            value={formData.companyEmail}
            onChange={(val) => handleChange("companyEmail", val)}
            isEditing={editMode}
            type="email"
            error={errors.companyEmail}
          />
        </div>
      </div>

      {confirm !== null && (
        <Modal
          title={title}
          message={message}
          onClose={() => setConfirm(null)}
          actions={
            <>
              {validData && (
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
//-------------------Billing Details ----------------------------
const BillingDetails = () => {
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState("Confirm Save");
  const [message, setMessage] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [confirmBtnName, setConfirmBtnName] = useState("Cancel");
  const [validData, setValidData] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    fullAddress: "",
    pinCode: "",
    city: "",
    state: "",
  });

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const confirmSave = () => {
    setEditMode(false);
    setMessage(`Billing Details ${editMode ? "updated" : "saved"}!`);
    setConfirm(null);
  };

  const handleSave = async () => {
    try {
      await billingSchema.validate(formData, { abortEarly: false });
      setErrors({});
      setTitle(`Confirm ${editMode ? "Update" : "Save"}`);
      setMessage(`Are you sure you want to ${editMode ? "Update" : "Save"}?`);
      setConfirmBtnName(editMode ? "Update" : "Save");
      setConfirm("true");
      setValidData(true);
    } catch (err) {
      if (err.inner) {
        const newErrors = {};
        err.inner.forEach(({ path, message }) => {
          newErrors[path] = message;
        });
        setErrors(newErrors);
      }
      setTitle("Alert!");
      setMessage("Please fix the highlighted errors before saving.");
      setConfirm("true");
      setValidData(false);
      setConfirmBtnName("Okay");
    }
  };

  return (
    <section
      aria-labelledby="billing-details-heading"
      className="bg-white  p-2 sm:p-4 rounded-md shadow-lg border"
    >
      <div className="flex items-center justify-between mb-2">
        <h2
          id="billing-details-heading"
          className="text-base sm:text-lg font-semibold text-gray-700 "
        >
          Billing Details
        </h2>

        {editMode ? (
          <div className="flex items-center gap-1">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 border rounded-2xl px-2 py-1 text-sm cursor-pointer bg-red-400 hover:text-white border-red-400"
              aria-label="Save Billing Details"
            >
              <span>{editMode ? "Update" : "Save"}</span>
              <CiSaveDown1 />
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="flex items-center gap-2 border rounded-2xl px-2 py-1 text-sm cursor-pointer border-red-400 hover:bg-red-400 hover:text-white text-gray-700 "
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-2 border rounded-2xl px-2 py-1 text-sm cursor-pointer hover:bg-green-400 hover:text-white text-gray-700 "
            aria-label="Edit Billing Details"
          >
            <span>Edit</span>
            <CiEdit />
          </button>
        )}
      </div>

      <div className="mt-4 flex w-full justify-between flex-row-reverse p-1 sm:p-4 gap-2 sm:gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 w-full text-sm sm:text-base">
          <EditableField
            label="Full Address"
            value={formData.fullAddress}
            onChange={(val) => handleChange("fullAddress", val)}
            isEditing={editMode}
            inputType="textarea"
            error={errors.fullAddress}
          />
          <EditableField
            label="Pin Code"
            value={formData.pinCode}
            onChange={(val) => handleChange("pinCode", val)}
            isEditing={editMode}
            error={errors.pinCode}
            maxLength={6}
          />
          <EditableField
            label="City"
            value={formData.city}
            onChange={(val) => handleChange("city", val)}
            isEditing={editMode}
            error={errors.city}
          />
          <EditableField
            label="State"
            value={formData.state}
            onChange={(val) => handleChange("state", val)}
            isEditing={editMode}
            error={errors.state}
          />
        </div>
      </div>

      {confirm !== null && (
        <Modal
          title={title}
          message={message}
          onClose={() => setConfirm(null)}
          actions={
            <>
              {validData && (
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

//------------------Other Details -------------------------------
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
        <h2
          id="other-details-heading"
          className="text-base sm:text-lg font-semibold text-gray-700 "
        >
          Other Details
        </h2>

        {editMode ? (
          <div className="flex items-center gap-1">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 border rounded-2xl px-2 py-1 text-sm cursor-pointer bg-red-400 hover:text-white border-red-400"
            >
              <span>{editMode ? "Update" : "Save"}</span>
              <CiSaveDown1 />
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="flex items-center gap-2 border rounded-2xl px-2 py-1 text-sm cursor-pointer border-red-400 hover:bg-red-400 hover:text-white text-gray-700 "
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-2 border rounded-2xl px-2 py-1 text-sm cursor-pointer hover:bg-green-400 hover:text-white text-gray-700 "
          >
            <span>Edit</span>
            <CiEdit />
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
