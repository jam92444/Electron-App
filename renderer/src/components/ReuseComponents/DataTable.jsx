import { FaPen, FaTrashCan } from "react-icons/fa6";
import CommonSearch from "./CommonSearch";

const DataTable = ({
  columns,
  data,
  onEdit,
  onDelete,
  onSearch,
  emptyMessage = "No records found.",
}) => {
  return (
    <div>
      <div className="">
        <h2 className="text-md font-semibold text-gray-800  mb-3">
          All {columns[0]?.label?.replace(/Name/i, "") || "Items"}
        </h2>
        <CommonSearch placeholder="Search sizes..." onChange={onSearch} />
      </div>

      {data?.length === 0 ? (
        <p className="text-gray-500 ">{emptyMessage}</p>
      ) : (
        <div className="overflow-x-auto rounded-md w-full">
          <table className="min-w-[400px] w-fit sm:w-full text-sm border-collapse">
            <thead className="bg-orange-100 text-white">
              <tr>
                <th className="p-2 pl-4 text-left whitespace-nowrap">Actions</th>
                {columns.map((col) => (
                  <th key={col.key} className="p-2 text-left whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-200  hover:bg-gray-50  transition-colors"
                >
                  <td className="p-2 text-start">
                    <div className="flex pl-3  gap-4">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(i)}
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                          title="Edit"
                        >
                          <FaPen />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(i)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Delete"
                        >
                          <FaTrashCan />
                        </button>
                      )}
                    </div>
                  </td>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="p-2 whitespace-nowrap text-gray-800 "
                    >
                      {row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DataTable;
