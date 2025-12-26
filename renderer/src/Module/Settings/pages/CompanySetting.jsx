import { useEffect, useState } from "react";
import * as yup from "yup";
import toast from "react-hot-toast";

import Input from "../../../components/ReuseComponents/Input";
import Textarea from "../../../components/ReuseComponents/TextArea";
import Modal from "../../../components/ReuseComponents/Modal";
import Button from "../../../components/ReuseComponents/Button";

import { Country, State, City } from "country-state-city";

import {
  getSettings,
  updateCompanySettings,
  updateBillingSettings,
  updateOtherSettings,
} from "../Services/settingService";

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
  if (!isEditing) {
    return (
      <div>
        <p className="text-xs text-gray-700">{label}</p>
        <p className="text-sm">{value || "NA"}</p>
      </div>
    );
  }

  if (inputType === "select") {
    return (
      <div>
        <label className="text-xs">{label}</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border rounded max-w-md p-2"
        >
          <option value="">Select {label}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  if (inputType === "textarea") {
    return (
      <Textarea
        label={label}
        value={value}
        classname="max-w-md"
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  return (
    <Input
      label={label}
      value={value}
      type={type}
      classname="max-w-md"
      maxLength={maxLength}
      onChange={(e) => onChange(e.target.value)}
      error={error}
    />
  );
};

/* ================= Validation ================= */
const companySchema = yup.object({
  companyName: yup.string().required("Company name is required"),
  gstTin: yup.string().required("GST TIN is required"),
  contactNumber: yup
    .string()
    .matches(/^\d{10}$/, "Must be 10 digits")
    .required("Contact number is required"),
  companyEmail: yup
    .string()
    .email("Invalid email")
    .required("Email is required"),
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

/* ================= MAIN ================= */
const CompanySetting = () => {
  return (
    <div className="p-4 space-y-4">
      <CompanyDetails />
      <BillingDetails />
      <OtherDetails />
    </div>
  );
};

/* ================= COMPANY ================= */
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

  useEffect(() => {
    getSettings().then((res) => {
      if (res?.success) {
        setFormData({
          companyName: res.data.companyName || "",
          gstTin: res.data.gstTin || "",
          contactNumber: res.data.contactNumber || "",
          companyEmail: res.data.companyEmail || "",
        });
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
    <section className="bg-white p-4 border rounded">
      <Header
        title="Company Details"
        editMode={editMode}
        setEditMode={setEditMode}
        onSave={handleSave}
      />

      <div className="grid grid-cols-2 gap-4">
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
            toast.success("Company details saved");
            setConfirm(false);
            setEditMode(false);
          }}
        />
      )}
    </section>
  );
};

/* ================= BILLING ================= */
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

  useEffect(() => {
    getSettings().then((res) => {
      if (res?.success) {
        setFormData({
          fullAddress: res.data.fullAddress || "",
          country: res.data.country || "",
          state: res.data.state || "",
          city: res.data.city || "",
          pinCode: res.data.pinCode || "",
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

  const countries = Country.getAllCountries();
  const states = formData.country
    ? State.getStatesOfCountry(formData.country)
    : [];
  const cities =
    formData.country && formData.state
      ? City.getCitiesOfState(formData.country, formData.state)
      : [];

  return (
    <section className="bg-white p-4 border rounded">
      <Header
        title="Billing Details"
        editMode={editMode}
        setEditMode={setEditMode}
        onSave={handleSave}
      />

      <div className="grid grid-cols-2 gap-4">
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
          options={countries.map((c) => ({
            value: c.isoCode,
            label: c.name,
          }))}
          value={formData.country}
          onChange={(v) =>
            setFormData({ ...formData, country: v, state: "", city: "" })
          }
          isEditing={editMode}
          error={errors.country}
        />

        <EditableField
          label="State"
          inputType="select"
          options={states.map((s) => ({
            value: s.isoCode,
            label: s.name,
          }))}
          value={formData.state}
          onChange={(v) =>
            setFormData({ ...formData, state: v, city: "" })
          }
          isEditing={editMode}
          error={errors.state}
        />

        <EditableField
          label="City"
          inputType="select"
          options={cities.map((c) => ({
            value: c.name,
            label: c.name,
          }))}
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

      {confirm && (
        <ConfirmModal
          message="Save billing details?"
          onCancel={() => setConfirm(false)}
          onConfirm={async () => {
            await updateBillingSettings(formData);
            toast.success("Billing details saved");
            setConfirm(false);
            setEditMode(false);
          }}
        />
      )}
    </section>
  );
};

/* ================= OTHER ================= */
const OtherDetails = () => {
  const [editMode, setEditMode] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [errors, setErrors] = useState({});
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
      }
    });
  }, []);

  const handleSave = () => {
    const newErrors = {};

    if (formData.supportContact && formData.supportContact.length !== 10) {
      newErrors.supportContact = "Must be 10 digits";
    }

    if (
      formData.enableInvoicePrefix &&
      formData.invoicePrefix.length !== 4
    ) {
      newErrors.invoicePrefix = "Prefix must be 4 characters";
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
    <section className="bg-white p-4 border rounded">
      <Header
        title="Other Details"
        editMode={editMode}
        setEditMode={setEditMode}
        onSave={handleSave}
      />

      <div className="grid grid-cols-2 gap-4">
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
          onChange={(v) =>
            setFormData({ ...formData, termsConditions: v })
          }
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
            await updateOtherSettings(formData);
            toast.success("Other settings saved");
            setConfirm(false);
            setEditMode(false);
          }}
        />
      )}
    </section>
  );
};

/* ================= HELPERS ================= */
const Header = ({ title, editMode, setEditMode, onSave }) => (
  <div className="flex justify-between mb-2">
    <h2 className="font-semibold">{title}</h2>
    {editMode ? (
      <div className="space-x-2">
        <Button buttonName="Save" onClick={onSave} />
        <Button buttonName="Cancel" onClick={() => setEditMode(false)} />
      </div>
    ) : (
      <Button buttonName="Edit" onClick={() => setEditMode(true)} />
    )}
  </div>
);

const ConfirmModal = ({ message, onCancel, onConfirm }) => (
  <Modal
    title="Confirm"
    message={message}
    onClose={onCancel}
    actions={
      <div className="max-w-lg">
        <Button buttonName="Cancel" onClick={onCancel} />
        <Button buttonName="Save" onClick={onConfirm} />
      </div>
    }
  />
);

export default CompanySetting;
