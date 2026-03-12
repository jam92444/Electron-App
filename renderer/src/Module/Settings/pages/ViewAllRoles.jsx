import Button from "../../../components/ReuseComponents/Button";

const ViewAllRoles = ({ roles, loading, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          All Roles
        </h2>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
          {roles.length} {roles.length === 1 ? "role" : "roles"}
        </span>
      </div>

      {loading ? (
        // Skeleton
        <div className="space-y-3 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-lg" />
          ))}
        </div>
      ) : roles.length === 0 ? (
        // ✅ Empty state
        <div className="text-center py-10 text-gray-400">
          <p className="text-3xl mb-2">🔐</p>
          <p className="text-sm font-medium">No roles yet</p>
          <p className="text-xs mt-1">Create your first role using the form above.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    <div className="flex items-center gap-2">
                      {role.name}
                      {role.name === "super_admin" && (
                        <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full font-medium">
                          System
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {role.description || <span className="text-gray-300 italic">No description</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        buttonName="Edit"
                        buttonType="edit"
                        onClick={() => onEdit(role)} // ✅ pass role object not index
                      />
                      {role.name !== "super_admin" && (
                        <Button
                          buttonName="Delete"
                          buttonType="delete"
                          onClick={() => onDelete(role)}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ViewAllRoles;