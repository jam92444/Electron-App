import { FaSearch } from "react-icons/fa";

const CommonSearch = ({ placeholder = "Search...", onChange }) => {
  return (
    <div className="relative w-full sm:w-72 my-4">
      <input
        type="text"
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-10 py-2 border rounded-lg shadow-sm text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none "
      />
      <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
    </div>
  );
};

export default CommonSearch;
