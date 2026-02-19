/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import * as yup from "yup";
import toast from "react-hot-toast";
import Input from "../../../components/ReuseComponents/Input";
import Textarea from "../../../components/ReuseComponents/TextArea";
import Modal from "../../../components/ReuseComponents/Modal";
import Button from "../../../components/ReuseComponents/Button";
import {
  getSettings,
  updateCompanySettings,
  updateBillingSettings,
  updateOtherSettings,
} from "../Services/settingService";
import { useStateContext } from "../../../context/StateContext";
import {
  SET_BILLING_SETTINGS,
  SET_COMPANY_SETTINGS,
  SET_OTHER_SETTINGS,
} from "../../../context/reducer/actionTypes";

const INDIA_COUNTRY = [{ value: "IN", label: "India" }];

const INDIA_STATES = [
  { value: "MH", label: "Maharashtra" },
  { value: "DL", label: "Delhi" },
  { value: "KA", label: "Karnataka" },
  { value: "TN", label: "Tamil Nadu" },
  { value: "GJ", label: "Gujarat" },
  { value: "RJ", label: "Rajasthan" },
  { value: "UP", label: "Uttar Pradesh" },
  { value: "MP", label: "Madhya Pradesh" },
  { value: "WB", label: "West Bengal" },
  { value: "PB", label: "Punjab" },
  { value: "HR", label: "Haryana" },
  { value: "BR", label: "Bihar" },
  { value: "TS", label: "Telangana" },
  { value: "AP", label: "Andhra Pradesh" },
  { value: "KL", label: "Kerala" },
];

/* ================= Editable Field ================= */

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
  const baseClass =
    "mt-1 p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400";

  if (!isEditing) {
    return (
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-800 mt-1">
          {value || "NA"}
        </p>
      </div>
    );
  }

  if (inputType === "select") {
    return (
      <div>
        <label className="text-xs text-gray-500">{label}</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseClass} bg-white`}
        >
          <option value="">Select {label}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  if (inputType === "textarea") {
    return (
      <Textarea
        label={label}
        value={value}
        classname={`${baseClass} h-24`}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  return (
    <Input
      label={label}
      value={value}
      type={type}
      classname={baseClass}
      maxLength={maxLength}
      onChange={(e) => onChange(e.target.value)}
      error={error}
    />
  );
};

/* ================= Header ================= */
const Header = ({ title, editMode, setEditMode, onSave }) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
    <h2 className="font-semibold text-lg text-gray-900">{title}</h2>
    <div className="mt-2 sm:mt-0 flex gap-2">
      {editMode ? (
        <>
          <Button
            buttonName="Save"
            onClick={onSave}
            className="bg-blue-600 text-white px-2 py-1 rounded"
          />
          <Button
            buttonName="Cancel"
            onClick={() => setEditMode(false)}
            className="bg-gray-200 px-2 py-1 rounded"
          />
        </>
      ) : (
        <Button
          buttonName="Edit"
          onClick={() => setEditMode(true)}
          className="bg-blue-600 text-white px-2 py-1 rounded"
        />
      )}
    </div>
  </div>
);

/* ================= Validation ================= */
const companySchema = yup.object({
  companyName: yup.string().required("Company name is required"),
  gstTin: yup.string().required("GST TIN is required"),
  contactNumber: yup
    .string()
    .matches(/^\d{10}$/, "Must be 10 digits")
    .required("Contact number is required"),
  companyEmail: yup.string().email("Invalid email"),
});

const billingSchema = yup.object({
  fullAddress: yup.string().required("Address is required"),
  country: yup.string().required("Country is required"),
  state: yup.string().required("State is required"),
  city: yup.string().required("City is required"),
  pinCode: yup
    .string()
    .matches(/^\d{6}$/, "Must be 6 digits")
    .required("Pin code is required"),
});

/* ================= CONFIRM MODAL ================= */
const ConfirmModal = ({ message, onCancel, onConfirm }) => (
  <Modal
    title="Confirm"
    message={message}
    onClose={onCancel}
    actions={
      <div className="flex gap-2 justify-end mt-4">
        <Button buttonName="Cancel" onClick={onCancel} />
        <Button buttonName="Save" onClick={onConfirm} />
      </div>
    }
  />
);

/* ================= MAIN COMPONENT WITH TABS ================= */
const CompanySetting = () => {
  const [activeTab, setActiveTab] = useState("company");

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col  justify-between items-start sm:items-start mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Company Settings</h1>
        <p className="text-gray-600 mt-2 sm:mt-0">
          Update company, billing, and other details in one place.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {["company", "billing", "other"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 font-medium ${
              activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === "company" && <CompanyDetails />}
        {activeTab === "billing" && <BillingDetails />}
        {activeTab === "other" && <OtherDetails />}
      </div>
    </div>
  );
};

/* ================= COMPANY DETAILS ================= */
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
  const { dispatch } = useStateContext();
  useEffect(() => {
    getSettings().then((res) => {
      // console.log("Response of the Company setting", res);
      if (res?.success) {
        setFormData({
          companyName: res.data?.companyName || "",
          gstTin: res.data?.gstTin || "",
          contactNumber: res.data?.contactNumber || "",
          companyEmail: res.data?.companyEmail || "",
        });
        const data = res.data;
        dispatch({
          type: SET_COMPANY_SETTINGS,
          payload: {
            companyName: data?.companyName || "",
            gstTin: data?.gstTin || "",
            contactNumber: data?.contactNumber || "",
            companyEmail: data?.companyEmail || "",
          },
        });
      } else {
        setFormData({});
      }
    });
  }, []);
  const handleSave = async () => {
    try {
      await companySchema.validate(formData, { abortEarly: false });
      setConfirm(true);
    } catch (e) {
      const err = {};
      e.inner.forEach((i) => (err[i.path] = i.message));
      setErrors(err);
      toast.error("Please fix validation errors");
    }
  };

  return (
    <div>
      <section className="bg-white p-4 border rounded">
        <Header
          title="Company Details"
          editMode={editMode}
          setEditMode={setEditMode}
          onSave={handleSave}
        />

        <div className="grid grid-cols-2 gap-4 mt-4">
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
            value={formData.contactNumber}
            maxLength={10}
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
          <ConfirmModal
            message="Save company details?"
            onCancel={() => setConfirm(false)}
            onConfirm={async () => {
              await updateCompanySettings(formData);
              // console.log("saved company data response", data);
              toast.success("Company details saved");
              setConfirm(false);
              setEditMode(false);
            }}
          />
        )}
      </section>
    </div>
  );
};

/* ================= BILLING DETAILS ================= */
const BillingDetails = () => {
  const [editMode, setEditMode] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const { dispatch } = useStateContext();

  const [formData, setFormData] = useState({
    fullAddress: "",
    country: "IN",
    state: "",
    city: "",
    pinCode: "",
  });

  useEffect(() => {
    getSettings().then((res) => {
      if (res?.success) {
        const data = res.data;

        setFormData({
          fullAddress: data.fullAddress || "",
          country: "IN",
          state: data.state || "",
          city: data.city || "",
          pinCode: data.pinCode || "",
        });

        dispatch({
          type: SET_BILLING_SETTINGS,
          payload: data,
        });
      }
    });
  }, []);

  const handleSave = async () => {
    try {
      await billingSchema.validate(formData, { abortEarly: false });
      setConfirm(true);
    } catch (e) {
      const err = {};
      e.inner.forEach((i) => (err[i.path] = i.message));
      setErrors(err);
      toast.error("Please fix validation errors");
    }
  };

  return (
    <section className="bg-white p-4 border rounded">
      <h2 className="font-semibold text-lg text-gray-900">Billing Details</h2>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <EditableField
          label="Full Address"
          inputType="textarea"
          value={formData.fullAddress}
          onChange={(v) => setFormData({ ...formData, fullAddress: v })}
          isEditing={editMode}
          error={errors.fullAddress}
        />

        <EditableField
          label="Country"
          inputType="select"
          options={INDIA_COUNTRY}
          value="IN"
          isEditing={false}
        />

        <EditableField
          label="State"
          inputType="select"
          options={INDIA_STATES}
          value={formData.state}
          onChange={(v) => setFormData({ ...formData, state: v })}
          isEditing={editMode}
          error={errors.state}
        />

        <EditableField
          label="City"
          value={formData.city}
          onChange={(v) => setFormData({ ...formData, city: v })}
          isEditing={editMode}
          error={errors.city}
        />

        <EditableField
          label="Pin Code"
          value={formData.pinCode}
          maxLength={6}
          onChange={(v) => setFormData({ ...formData, pinCode: v })}
          isEditing={editMode}
          error={errors.pinCode}
        />
      </div>

      {editMode ? (
        <div className="mt-4 flex gap-2">
          <Button buttonName="Save" onClick={handleSave} />
          <Button buttonName="Cancel" onClick={() => setEditMode(false)} />
        </div>
      ) : (
        <Button
          buttonName="Edit"
          onClick={() => setEditMode(true)}
          className="mt-4"
        />
      )}

      {confirm && (
        <Modal
          title="Confirm"
          message="Save billing details?"
          onClose={() => setConfirm(false)}
          actions={
            <div className="flex gap-2 justify-end">
              <Button buttonName="Cancel" onClick={() => setConfirm(false)} />
              <Button
                buttonName="Save"
                onClick={async () => {
                  await updateBillingSettings(formData);
                  toast.success("Billing details saved");
                  setConfirm(false);
                  setEditMode(false);
                }}
              />
            </div>
          }
        />
      )}
    </section>
  );
};

/* ================= OTHER DETAILS ================= */
const OtherDetails = () => {
  const [editMode, setEditMode] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const { dispatch } = useStateContext();
  const [formData, setFormData] = useState({
    supportContact: "",
    website: "",
    termsConditions: "",
    invoicePrefix: "",
    enableInvoicePrefix: false,
  });

  useEffect(() => {
    getSettings().then((res) => {
      if (res?.success) {
        setFormData({
          supportContact: res.data.supportContact || "",
          website: res.data.website || "",
          termsConditions: res.data.termsConditions || "",
          invoicePrefix: res.data.invoicePrefix || "",
          enableInvoicePrefix: !!res.data.enableInvoicePrefix,
        });

        const data = res.data;
        dispatch({
          type: SET_OTHER_SETTINGS,
          payload: {
            supportContact: data.supportContact,
            website: data.website,
            termsConditions: data.termsConditions,
            invoicePrefix: data.invoicePrefix,
            enableInvoicePrefix: !!data.enableInvoicePrefix,
            lastInvoiceNumber: data.lastInvoiceNumber,
          },
        });
      }
    });
  }, []);

  const handleSave = () => {
    const newErrors = {};

    if (formData.supportContact && formData.supportContact.length !== 10) {
      newErrors.supportContact = "Must be 10 digits";
    }

    if (formData.enableInvoicePrefix && formData.invoicePrefix.length !== 2) {
      newErrors.invoicePrefix = "Prefix must be atleast 2 characters";
    }

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      toast.error("Please fix validation errors");
      return;
    }

    setErrors({});
    setConfirm(true);
  };

  return (
    <div>
      <section className="bg-white p-4 border rounded">
        <Header
          title="Other Details"
          editMode={editMode}
          setEditMode={setEditMode}
          onSave={handleSave}
        />

        <div className="grid grid-cols-2 gap-4 mt-4">
          <EditableField
            label="Support Contact"
            value={formData.supportContact}
            maxLength={10}
            onChange={(v) => setFormData({ ...formData, supportContact: v })}
            isEditing={editMode}
            error={errors.supportContact}
          />

          <EditableField
            label="Website"
            value={formData.website}
            onChange={(v) => setFormData({ ...formData, website: v })}
            isEditing={editMode}
          />

          <EditableField
            label="Terms & Conditions"
            inputType="textarea"
            value={formData.termsConditions}
            onChange={(v) => setFormData({ ...formData, termsConditions: v })}
            isEditing={editMode}
          />

          <div className="flex items-center gap-2 col-span-2">
            <input
              type="checkbox"
              checked={formData.enableInvoicePrefix}
              disabled={!editMode}
              onChange={() =>
                setFormData((p) => ({
                  ...p,
                  enableInvoicePrefix: !p.enableInvoicePrefix,
                  invoicePrefix: p.enableInvoicePrefix ? "" : p.invoicePrefix,
                }))
              }
            />
            <label className="text-sm">Enable Invoice Prefix</label>
          </div>

          <EditableField
            label="Invoice Prefix"
            value={formData.invoicePrefix}
            maxLength={4}
            onChange={(v) =>
              setFormData({ ...formData, invoicePrefix: v.toUpperCase() })
            }
            isEditing={editMode && formData.enableInvoicePrefix}
            error={errors.invoicePrefix}
          />
        </div>

        {confirm && (
          <ConfirmModal
            message="Save other settings?"
            onCancel={() => setConfirm(false)}
            onConfirm={async () => {
              await updateOtherSettings({
                ...formData,
                enableInvoicePrefix: formData.enableInvoicePrefix ? 1 : 0,
              });
              toast.success("Other settings saved");
              setConfirm(false);
              setEditMode(false);
            }}
          />
        )}
      </section>
    </div>
  );
};

export default CompanySetting;
