const Input = ({
  placeholder,
  label,
  type = "text",
  maxlength,
  onChange,
  classname = "",
  error = "",
  ...rest
}) => {
  const inputId = label?.toLowerCase().replace(/\s+/g, "-") || "input";

  return (
    <div className="relative flex flex-col mt-4">
      {label && (
        <label
          htmlFor={inputId}
          className="ml-3 sm:ml-4 text-xs bg-white text-gray-500  font-normal px-1 absolute -top-2"
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        maxLength={maxlength}
        onChange={onChange}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...rest}
        className={`
          px-4 py-2 border rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2
          ${
            error
              ? "border-red-500 focus:ring-red-200"
              : "border-gray-400 focus:ring-orange-100"
          }
          ${classname}
     
        `}
      />

      {error && (
        <span
          id={`${inputId}-error`}
          className="text-red-500 text-xs mt-1 ml-1"
        >
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
