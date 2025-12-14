const Textarea = ({
  placeholder,
  label,
  maxlength,
  onchange,
  classname,
  rows = 4,
  ...rest
}) => {
  const inputId = label?.toLowerCase().replace(/\s+/g, "-") || "textarea";

  return (
    <div className="relative flex flex-col mt-2">
      <label
        htmlFor={inputId}
        className="ml-3 sm:ml-4 text-xs bg-white  rounded  px-1 absolute -top-2 z-20 "
      >
        {label}
      </label>
      <textarea
        id={inputId}
        placeholder={placeholder}
        maxLength={maxlength}
        onChange={onchange}
        rows={rows}
        {...rest}
        className={`
          ${classname} 
          px-4 py-2 border border-gray-400 rounded-lg  
          text-sm sm:text-md resize-none
          focus:outline-none focus:ring-2 focus:ring-orange-100 
        `}
      />
    </div>
  );
};

export default Textarea;
