import { useEffect, useRef } from "react";
import Button from "./Button";

const Modal = ({ title, message, onClose, actions }) => {
  const modalRef = useRef(null);

  // Disable scroll + trap focus
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // Disable scroll
    document.body.setAttribute("aria-hidden", "true"); // Hide background for screen readers

    // Focus the modal on open
    modalRef.current?.focus();

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.removeAttribute("aria-hidden");
    };
  }, []);

  // Trap focus inside modal
  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      const focusable = modalRef.current.querySelectorAll(
        "button, [href], input, textarea, [tabindex]:not([tabindex='-1'])"
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    if (e.key === "Escape") onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 "
      role="dialog"
      aria-modal="true"
      onKeyDown={handleKeyDown}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>

      {/* Modal box */}
      <div
        ref={modalRef}
        className="relative bg-white p-6 rounded shadow-md max-w-xl w-full max-h-[90vh] overflow-y-auto z-10"
        onClick={(e) => e.stopPropagation()}
        tabIndex="0"
      >
        <h3 className="text-md font-semibold mb-3 text-gray-800">{title}</h3>
        <div className="text-sm text-gray-600 mb-4">{message}</div>
        <div className="flex justify-end gap-3">
          {actions || <Button buttonName="Close" onClick={onClose} />}
        </div>
      </div>
    </div>
  );
};

export default Modal;
