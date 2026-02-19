import Select from "react-select";
import Input from "../../../components/ReuseComponents/Input";
import { useState } from "react";

/* ================= INDIA STATIC DATA ================= */

const COUNTRY_OPTIONS = [{ label: "India", value: "IN" }];

const STATE_OPTIONS = [
  { label: "Maharashtra", value: "MH" },
  { label: "Delhi", value: "DL" },
  { label: "Karnataka", value: "KA" },
  { label: "Tamil Nadu", value: "TN" },
  { label: "Gujarat", value: "GJ" },
  { label: "Rajasthan", value: "RJ" },
  { label: "Uttar Pradesh", value: "UP" },
  { label: "Madhya Pradesh", value: "MP" },
  { label: "West Bengal", value: "WB" },
  { label: "Punjab", value: "PB" },
  { label: "Haryana", value: "HR" },
  { label: "Bihar", value: "BR" },
  { label: "Telangana", value: "TS" },
  { label: "Andhra Pradesh", value: "AP" },
  { label: "Kerala", value: "KL" },
];

/* ================= Utility ================= */

const capitalizeWords = (str) =>
  str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

/* ================= Component ================= */

const VendorBasicDetails = ({ vendorData, setVendorData }) => {
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "vendorName":
        if (!value.trim()) error = "Vendor name is required";
        break;

      case "phone":
        if (!/^[6-9]\d{9}$/.test(value))
          error = "Enter valid 10 digit mobile number";
        break;

      case "email":
        if (!/^\S+@\S+\.\S+$/.test(value)) error = "Enter valid email address";
        break;

      case "country":
        if (!value) error = "Country is required";
        break;

      case "state":
        if (!value) error = "State is required";
        break;

      case "city":
        if (!value.trim()) error = "City is required";
        break;

      case "address1":
        if (!value.trim()) error = "Address is required";
        break;

      case "gstNumber":
        if (
          value &&
          !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
            value.toUpperCase(),
          )
        ) {
          error = "Invalid GST number";
        }
        break;

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  return (
    <div className="mb-8 p-4 rounded-lg">
      <h2 className="font-semibold mb-3 text-lg">Basic Details</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Vendor Name */}
        <Input
          label="Vendor Name *"
          value={vendorData.vendorName}
          classname="capitalize"
          onChange={(e) => {
            const capitalized = capitalizeWords(e.target.value);
            setVendorData({ ...vendorData, vendorName: capitalized });
            validateField("vendorName", capitalized);
          }}
          error={errors.vendorName}
        />

        {/* Contact Person */}
        <Input
          label="Contact Person"
          classname="capitalize"
          value={vendorData.contactPerson}
          onChange={(e) =>
            setVendorData({
              ...vendorData,
              contactPerson: capitalizeWords(e.target.value),
            })
          }
        />

        {/* Phone */}
        <Input
          label="Phone *"
          value={vendorData.phone}
          onChange={(e) => {
            setVendorData({ ...vendorData, phone: e.target.value });
            validateField("phone", e.target.value);
          }}
          error={errors.phone}
        />

        {/* WhatsApp */}
        <Input
          label="WhatsApp"
          value={vendorData.whatsapp}
          onChange={(e) =>
            setVendorData({ ...vendorData, whatsapp: e.target.value })
          }
        />

        {/* Email */}
        <Input
          label="Email"
          value={vendorData.email}
          onChange={(e) => {
            setVendorData({ ...vendorData, email: e.target.value });
            validateField("email", e.target.value);
          }}
          error={errors.email}
        />

        {/* Country (Fixed to India) */}
        <div className="relative mt-4">
          <label className="text-xs font-medium absolute bg-white -top-2 left-4 px-1 text-gray-100 z-20">
            Country *
          </label>
          <Select
            options={COUNTRY_OPTIONS}
            value={COUNTRY_OPTIONS[0]}
            isDisabled
          />
        </div>

        {/* State */}
        <div className="relative mt-4">
          <label className="text-xs font-medium absolute bg-white -top-2 left-4 px-1 text-gray-100 z-20">
            State *
          </label>
          <Select
            options={STATE_OPTIONS}
            value={STATE_OPTIONS.find((s) => s.value === vendorData.state)}
            onChange={(selected) => {
              setVendorData({
                ...vendorData,
                country: "IN",
                state: selected.value,
              });
              validateField("state", selected.value);
            }}
            placeholder="Select State"
          />
          {errors.state && (
            <p className="text-red-500 text-xs mt-1">{errors.state}</p>
          )}
        </div>

        {/* City (Manual Input Now) */}
        <Input
          label="City *"
          value={vendorData.city}
          onChange={(e) => {
            setVendorData({ ...vendorData, city: e.target.value });
            validateField("city", e.target.value);
          }}
          error={errors.city}
        />

        {/* GST Number */}
        <Input
          label="GST Number"
          value={vendorData.gstNumber}
          onChange={(e) => {
            const value = e.target.value.toUpperCase();
            setVendorData({ ...vendorData, gstNumber: value });
            validateField("gstNumber", value);
          }}
          error={errors.gstNumber}
        />

        {/* Address */}
        <Input
          label="Address Line 1 *"
          value={vendorData.address1}
          onChange={(e) =>
            setVendorData({ ...vendorData, address1: e.target.value })
          }
          error={errors.address1}
        />

        <Input
          label="Address Line 2"
          value={vendorData.address2}
          onChange={(e) =>
            setVendorData({ ...vendorData, address2: e.target.value })
          }
        />
      </div>
    </div>
  );
};

export default VendorBasicDetails;
