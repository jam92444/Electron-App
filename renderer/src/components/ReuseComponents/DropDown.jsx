// src/components/ReuseComponents/DropDown.jsx
import { Select } from "antd";

const DropDown = ({
  label,
  placeholder = "Select an option",
  options = [],
  value,
  onChange,
  name,
  error = "",
  className = "",
  popupClassName = "",
  disabled = false,
  showSearch = true,
}) => {
  const handleChange = (val) => {
    if (onChange) {
      // Simulate a standard input-like event for consistency
      onChange({ target: { name, value: val } });
    }
  };

  return (
    <div className={`relative flex flex-col mt-4 ${className}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={name}
          className="ml-3 sm:ml-4 text-xs text-gray-500  font-normal px-1 mb-1"
        >
          {label}
        </label>
      )}

      {/* AntD Select */}
      <Select
        id={name}
        value={value || undefined}
        placeholder={placeholder}
        onChange={handleChange}
        options={options}
        showSearch={showSearch}
        optionFilterProp="label"
        className={`w-full custom-ant-select ${error ? "border-red-500" : ""}`}
        popupClassName={`custom-ant-dropdown ${popupClassName}`}
        disabled={disabled}
        filterOption={(input, option) =>
          option?.label?.toLowerCase().includes(input.toLowerCase())
        }
      />

      {/* Error message */}
      {error && (
        <span className="text-red-500 text-xs mt-1 ml-1">{error}</span>
      )}
    </div>
  );
};

export default DropDown;
