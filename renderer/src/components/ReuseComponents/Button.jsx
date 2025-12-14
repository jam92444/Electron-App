import React from "react";

const Button = ({
  buttonName,
  buttonType = "",
  classname = "",
  withIcon = false,
  icon = "",
  ...rest
}) => {
  // Determine base style based on buttonType
  let typeStyle = "";

  switch (buttonType) {
    case "normal":
      typeStyle = "bg-white text-orange-100 border-[1px] border-orange-100 ";
    case "save":
      typeStyle = "bg-orange-100 text-white border-[1px] border-orange-100 ";
      break;
    case "edit":
      typeStyle = "bg-green-300 text-white border-[1px] border-orange-100";
      break;
    case "delete":
      typeStyle = "bg-red-400 text-white border-[1px] border-orange-100";
      break;
    default:
      typeStyle = "bg-white text-orange-100 border-[1px] border-orange-100 ";
  }

  return (
    <button
      className={`
        ${withIcon ? "flex items-center gap-1 sm:gap-2" : ""}
        ${typeStyle}
        ${classname} px-3 sm:px-5 py-1 sm:py-2 min-w-[100px] rounded-lg text-sm font-medium sm:text-normal hover:brightness-95 transition-all duration-150 hover:scale-95 
      `}
      {...rest}
    >
      {icon ? icon : ""} {buttonName}
    </button>
  );
};

export default Button;
