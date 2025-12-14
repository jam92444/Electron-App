import React from "react";
import assets from "../../Utils/asset";

const Spinner = () => {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-neutral-50   transition-colors duration-300">
      <div className="relative flex flex-col justify-center items-center w-full max-w-md p-6">
        {/* Background Logo Highlight */}
        <img
          src={assets.logo}
          alt="Background Logo"
          className="absolute inset-1/2 max-w-[60vw] max-h-[60vh] -translate-x-1/2 -translate-y-1/2 opacity-50 select-none pointer-events-none filter blur-sm"
          aria-hidden="true"
        />

        {/* Spinner */}
        <svg
          className="animate-spin h-14 w-14 text-primary-dark  mb-6 relative z-10"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-label="Loading spinner"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>

        {/* Loading Text */}
        <p className="text-primary-dark  font-semibold text-lg tracking-wide font-Ovo relative z-10">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default Spinner;
