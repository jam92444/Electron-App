import { FaPen, FaTrashCan } from "react-icons/fa6";

const DataTable = ({
  columns,
  data,
  onEdit,
  onDelete,
  emptyMessage = "No records found.",
}) => {
  return (
    <div>
      {data?.length === 0 ? (
        <p className="text-gray-500">{emptyMessage}</p>
      ) : (
        <div className="overflow-x-auto rounded-md w-full">
          <table className="min-w-[400px] w-fit sm:w-full text-sm border-collapse">
            <thead className="bg-orange-100 text-white">
              <tr>
                <th className="p-2 pl-4 text-left whitespace-nowrap">
                  Actions
                </th>
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
                  key={row.id ?? i}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="p-2 text-start">
                    <div className="flex pl-3 gap-4">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(i)}
                          className="text-blue-500 hover:text-blue-700"
                          title="Edit"
                        >
                          <FaPen />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(i)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <FaTrashCan />
                        </button>
                      )}
                    </div>
                  </td>

                  {columns.map((col) => {
                    const value = row[col.key];

                    return (
                      <td
                        key={col.key}
                        className="p-2 whitespace-nowrap text-gray-800"
                      >
                        {col.render
                          ? col.render(value, row)
                          : String(value ?? "")}
                      </td>
                    );
                  })}
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
