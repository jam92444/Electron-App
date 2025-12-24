import Select from "react-select";
import Input from "../../../components/ReuseComponents/Input";
import { Country, State, City } from "country-state-city";
import { useState } from "react";

// Utility function to capitalize each word
const capitalizeWords = (str) =>
  str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

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
        if (!value) error = "City is required";
        break;

      case "address1":
        if (!value.trim()) error = "Address is required";
        break;

      case "gstNumber":
        if (
          value &&
          !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
            value.toUpperCase()
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

  // ----- Data -----
  const countryOptions = Country.getAllCountries().map((c) => ({
    label: c.name,
    value: c.isoCode,
  }));

  const stateOptions = vendorData.country
    ? State.getStatesOfCountry(vendorData.country).map((s) => ({
        label: s.name,
        value: s.isoCode,
      }))
    : [];

  const cityOptions =
    vendorData.country && vendorData.state
      ? City.getCitiesOfState(vendorData.country, vendorData.state).map(
          (c) => ({
            label: c.name,
            value: c.name,
          })
        )
      : [];

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
          error={errors.contactPerson}
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
          label="Email *"
          value={vendorData.email}
          classname="text-normal"
          onChange={(e) => {
            setVendorData({ ...vendorData, email: e.target.value });
            validateField("email", e.target.value);
          }}
          error={errors.email}
        />

        {/* Country */}
        <div className="relative mt-4">
          <label className="text-xs font-medium absolute bg-white -top-2 left-4 px-1 text-gray-100 z-20">
            Country *
          </label>
          <Select
            options={countryOptions}
            value={countryOptions.find((c) => c.value === vendorData.country)}
            onChange={(selected) => {
              setVendorData({
                ...vendorData,
                country: selected.value,
                state: "",
                city: "",
              });
              validateField("country", selected.value);
            }}
            placeholder="Select Country"
          />
          {errors.country && (
            <p className="text-red-500 text-xs mt-1">{errors.country}</p>
          )}
        </div>

        {/* State */}
        <div className="relative mt-4">
          <label className="text-xs font-medium absolute bg-white -top-2 left-4 px-1 text-gray-100 z-20">
            State *
          </label>
          <Select
            options={stateOptions}
            value={stateOptions.find((s) => s.value === vendorData.state)}
            onChange={(selected) => {
              setVendorData({
                ...vendorData,
                state: selected.value,
                city: "",
              });
              validateField("state", selected.value);
            }}
            placeholder="Select State"
            isDisabled={!vendorData.country}
          />
          {errors.state && (
            <p className="text-red-500 text-xs mt-1">{errors.state}</p>
          )}
        </div>

        {/* City */}
        <div className="relative mt-4">
          <label className="text-xs font-medium absolute bg-white -top-2 left-4 px-1 text-gray-100 z-20">
            City *
          </label>
          <Select
            options={cityOptions}
            value={cityOptions.find((c) => c.value === vendorData.city)}
            onChange={(selected) => {
              setVendorData({ ...vendorData, city: selected.value });
              validateField("city", selected.value);
            }}
            placeholder="Select City"
            isDisabled={!vendorData.state}
          />
          {errors.city && (
            <p className="text-red-500 text-xs mt-1">{errors.city}</p>
          )}
        </div>

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
