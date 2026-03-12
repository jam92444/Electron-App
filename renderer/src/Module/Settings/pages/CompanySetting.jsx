/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback } from "react";
import * as yup from "yup";
import toast from "react-hot-toast";
import Input from "../../../components/ReuseComponents/Input";
import Textarea from "../../../components/ReuseComponents/TextArea";
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

// ─── Validation schemas ───────────────────────────────────────────────────────
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

// ─── EditableField ────────────────────────────────────────────────────────────
const EditableField = ({
  label, value, onChange, isEditing,
  type = "text", inputType = "input",
  error, maxLength, options = [],
}) => {
  const baseClass =
    "mt-1 p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm";

  if (!isEditing) {
    // ✅ For selects, show label not value code
    const displayValue =
      inputType === "select"
        ? options.find((o) => o.value === value)?.label || value || "—"
        : value || "—";

    return (
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-gray-800 mt-1">{displayValue}</p>
      </div>
    );
  }

  if (inputType === "select") {
    return (
      <div>
        <label className="text-xs text-gray-500 font-medium">{label}</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseClass} bg-white`}
        >
          <option value="">Select {label}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
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

// ─── Section Card wrapper ─────────────────────────────────────────────────────
// ✅ Visual highlight when in edit mode
const SectionCard = ({ children, isEditing }) => (
  <section
    className={`bg-white p-5 border rounded-xl transition-all duration-200 ${
      isEditing ? "border-blue-300 shadow-md ring-1 ring-blue-100" : "border-gray-200 shadow-sm"
    }`}
  >
    {children}
  </section>
);

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({ title, subtitle, editMode, onEdit, onSave, onCancel, isSaving }) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5">
    <div>
      <h2 className="font-semibold text-base text-gray-900">{title}</h2>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
    <div className="mt-2 sm:mt-0 flex gap-2">
      {editMode ? (
        <>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </>
      ) : (
        <button
          onClick={onEdit}
          className="px-3 py-1.5 text-sm border border-gray-300 hover:border-blue-400 hover:text-blue-600 text-gray-600 rounded-lg font-medium transition-colors"
        >
          ✏️ Edit
        </button>
      )}
    </div>
  </div>
);

// ─── Skeleton loader ──────────────────────────────────────────────────────────
const SettingsSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-48" />
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-24" />
            <div className="h-8 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const CompanySetting = () => {
  const [activeTab, setActiveTab] = useState("company");
  const [settingsData, setSettingsData] = useState(null); // ✅ fetch once here
  const [loading, setLoading] = useState(true);
  const { dispatch } = useStateContext();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await getSettings();
      if (res?.success) {
        setSettingsData(res.data);
        // Dispatch all at once
        dispatch({ type: SET_COMPANY_SETTINGS, payload: res.data });
        dispatch({ type: SET_BILLING_SETTINGS, payload: res.data });
        dispatch({ type: SET_OTHER_SETTINGS,   payload: res.data });
      }
      setLoading(false);
    };
    load();
  }, []);

  const tabs = [
    { id: "company", label: "Company",  icon: "🏢" },
    { id: "billing", label: "Billing",  icon: "📍" },
    { id: "other",   label: "Other",    icon: "⚙️" },
  ];

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Company Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your company, billing, and invoice preferences.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {loading ? (
        <SettingsSkeleton />
      ) : (
        <div className="space-y-6">
          {/* ✅ Keep all tabs mounted (display:none) so unsaved state isn't lost */}
          <div className={activeTab === "company" ? "" : "hidden"}>
            <CompanyDetails initialData={settingsData} />
          </div>
          <div className={activeTab === "billing" ? "" : "hidden"}>
            <BillingDetails initialData={settingsData} />
          </div>
          <div className={activeTab === "other" ? "" : "hidden"}>
            <OtherDetails initialData={settingsData} />
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Company Details ──────────────────────────────────────────────────────────
const CompanyDetails = ({ initialData }) => {
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors]     = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const defaultForm = useCallback(() => ({
    companyName:   initialData?.companyName   || "",
    gstTin:        initialData?.gstTin        || "",
    contactNumber: initialData?.contactNumber || "",
    companyEmail:  initialData?.companyEmail  || "",
  }), [initialData]);

  const [formData, setFormData] = useState(defaultForm);

  // ✅ Cancel reverts to saved data and clears errors
  const handleCancel = () => {
    setFormData(defaultForm());
    setErrors({});
    setEditMode(false);
  };

  const set = (key) => (v) => setFormData((p) => ({ ...p, [key]: v }));

  const handleSave = async () => {
    try {
      await companySchema.validate(formData, { abortEarly: false });
    } catch (e) {
      const err = {};
      e.inner.forEach((i) => (err[i.path] = i.message));
      setErrors(err);
      toast.error("Please fix the errors before saving");
      return;
    }

    setIsSaving(true);
    try {
      await updateCompanySettings(formData);
      toast.success("Company details saved");
      setErrors({});
      setEditMode(false);
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SectionCard isEditing={editMode}>
      <SectionHeader
        title="Company Details"
        subtitle="Your business identity shown on invoices"
        editMode={editMode}
        onEdit={() => setEditMode(true)}
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={isSaving}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <EditableField label="Company Name"   value={formData.companyName}   onChange={set("companyName")}   isEditing={editMode} error={errors.companyName} />
        <EditableField label="GST TIN"        value={formData.gstTin}        onChange={set("gstTin")}        isEditing={editMode} error={errors.gstTin} />
        <EditableField label="Contact Number" value={formData.contactNumber} onChange={set("contactNumber")} isEditing={editMode} error={errors.contactNumber} maxLength={10} />
        <EditableField label="Company Email"  value={formData.companyEmail}  onChange={set("companyEmail")}  isEditing={editMode} error={errors.companyEmail} type="email" />
      </div>
    </SectionCard>
  );
};

// ─── Billing Details ──────────────────────────────────────────────────────────
const BillingDetails = ({ initialData }) => {
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors]     = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const defaultForm = useCallback(() => ({
    fullAddress: initialData?.fullAddress || "",
    country:     "IN",
    state:       initialData?.state       || "",
    city:        initialData?.city        || "",
    pinCode:     initialData?.pinCode     || "",
  }), [initialData]);

  const [formData, setFormData] = useState(defaultForm);

  const handleCancel = () => {
    setFormData(defaultForm());
    setErrors({});
    setEditMode(false);
  };

  const set = (key) => (v) => setFormData((p) => ({ ...p, [key]: v }));

  const handleSave = async () => {
    try {
      await billingSchema.validate(formData, { abortEarly: false });
    } catch (e) {
      const err = {};
      e.inner.forEach((i) => (err[i.path] = i.message));
      setErrors(err);
      toast.error("Please fix the errors before saving");
      return;
    }

    setIsSaving(true);
    try {
      await updateBillingSettings(formData);
      toast.success("Billing details saved");
      setErrors({});
      setEditMode(false);
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SectionCard isEditing={editMode}>
      <SectionHeader
        title="Billing & Address"
        subtitle="Address printed on your invoices and receipts"
        editMode={editMode}
        onEdit={() => setEditMode(true)}
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={isSaving}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="sm:col-span-2">
          <EditableField label="Full Address" inputType="textarea" value={formData.fullAddress} onChange={set("fullAddress")} isEditing={editMode} error={errors.fullAddress} />
        </div>
        <EditableField label="Country" inputType="select" options={INDIA_COUNTRY} value="IN" isEditing={false} />
        <EditableField label="State"   inputType="select" options={INDIA_STATES}  value={formData.state}   onChange={set("state")}   isEditing={editMode} error={errors.state} />
        <EditableField label="City"    value={formData.city}    onChange={set("city")}    isEditing={editMode} error={errors.city} />
        <EditableField label="Pin Code" value={formData.pinCode} onChange={set("pinCode")} isEditing={editMode} error={errors.pinCode} maxLength={6} />
      </div>
    </SectionCard>
  );
};

// ─── Other Details ────────────────────────────────────────────────────────────
const OtherDetails = ({ initialData }) => {
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors]     = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const defaultForm = useCallback(() => ({
    supportContact:      initialData?.supportContact      || "",
    website:             initialData?.website             || "",
    termsConditions:     initialData?.termsConditions     || "",
    invoicePrefix:       initialData?.invoicePrefix       || "",
    enableInvoicePrefix: !!initialData?.enableInvoicePrefix,
  }), [initialData]);

  const [formData, setFormData] = useState(defaultForm);

  const handleCancel = () => {
    setFormData(defaultForm());
    setErrors({});
    setEditMode(false);
  };

  const set = (key) => (v) => setFormData((p) => ({ ...p, [key]: v }));

  const handleSave = async () => {
    const newErrors = {};
    if (formData.supportContact && !/^\d{10}$/.test(formData.supportContact))
      newErrors.supportContact = "Must be 10 digits";
    if (formData.enableInvoicePrefix && formData.invoicePrefix.length < 2)
      newErrors.invoicePrefix = "Prefix must be at least 2 characters";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      toast.error("Please fix the errors before saving");
      return;
    }

    setIsSaving(true);
    try {
      await updateOtherSettings({
        ...formData,
        enableInvoicePrefix: formData.enableInvoicePrefix ? 1 : 0,
      });
      toast.success("Settings saved");
      setErrors({});
      setEditMode(false);
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SectionCard isEditing={editMode}>
      <SectionHeader
        title="Other Settings"
        subtitle="Support info, invoice prefix and terms"
        editMode={editMode}
        onEdit={() => setEditMode(true)}
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={isSaving}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <EditableField label="Support Contact" value={formData.supportContact} onChange={set("supportContact")} isEditing={editMode} error={errors.supportContact} maxLength={10} />
        <EditableField label="Website"         value={formData.website}        onChange={set("website")}        isEditing={editMode} />
        <div className="sm:col-span-2">
          <EditableField label="Terms & Conditions" inputType="textarea" value={formData.termsConditions} onChange={set("termsConditions")} isEditing={editMode} />
        </div>

        {/* Invoice Prefix toggle */}
        <div className="sm:col-span-2">
          <label className={`flex items-center gap-3 cursor-pointer w-fit ${!editMode ? "opacity-60 pointer-events-none" : ""}`}>
            <div
              onClick={() => editMode && setFormData((p) => ({
                ...p,
                enableInvoicePrefix: !p.enableInvoicePrefix,
                invoicePrefix: p.enableInvoicePrefix ? "" : p.invoicePrefix,
              }))}
              className={`w-10 h-5 rounded-full transition-colors relative ${
                formData.enableInvoicePrefix ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                formData.enableInvoicePrefix ? "translate-x-5" : "translate-x-0.5"
              }`} />
            </div>
            <span className="text-sm font-medium text-gray-700">Enable Invoice Prefix</span>
          </label>
          {formData.enableInvoicePrefix && (
            <div className="mt-3 max-w-xs">
              <EditableField
                label="Invoice Prefix (e.g. INV)"
                value={formData.invoicePrefix}
                maxLength={4}
                onChange={(v) => set("invoicePrefix")(v.toUpperCase())}
                isEditing={editMode}
                error={errors.invoicePrefix}
              />
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
};

export default CompanySetting;