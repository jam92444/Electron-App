/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import Button from "../../../components/ReuseComponents/Button";

const EMPTY_FORM = { id: null, name: "", description: "", permissions: [] };

const AddRoleForm = ({
  initialRole,
  permissions,
  onSave,
  disabled,
  isEdit,
  onCancel,
}) => {
  const [formData, setFormData] = useState(EMPTY_FORM);

  // ✅ Sync with initialRole including clearing when it becomes null
  useEffect(() => {
    setFormData(initialRole ? { ...initialRole } : EMPTY_FORM);
  }, [initialRole]);

  const togglePermission = (id) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(id)
        ? prev.permissions.filter((p) => p !== id)
        : [...prev.permissions, id],
    }));
  };

  // ✅ Toggle all permissions within a single module
  const toggleModule = (modulePerms) => {
    const ids = modulePerms.map((p) => p.id);
    const allSelected = ids.every((id) => formData.permissions.includes(id));
    setFormData((prev) => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter((id) => !ids.includes(id))
        : [...new Set([...prev.permissions, ...ids])],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onSave(formData, isEdit);
    // ✅ Only reset if save succeeded
    if (success) setFormData(EMPTY_FORM);
  };

  // Group permissions by module
  const grouped = permissions.reduce((acc, perm) => {
    const [module] = perm.permission_key.split(".");
    if (!acc[module]) acc[module] = [];
    acc[module].push({ ...perm, action: perm.permission_key.split(".")[1] });
    return acc;
  }, {});

  const isWildcardActive = permissions
    .filter((p) => p.permission_key === "*.*")
    .some((p) => formData.permissions.includes(p.id));

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Role Name */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          Role Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={disabled}
          required
          placeholder="e.g. Sales Manager"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-sm font-medium text-gray-700">Description</label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          disabled={disabled}
          placeholder="Brief description of this role"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Permissions */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">
            Permissions
          </label>
          <span className="text-xs text-gray-400">
            {formData.permissions.length} selected
          </span>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 max-h-80 overflow-y-auto space-y-4 bg-gray-50">
          {Object.entries(grouped).map(([module, perms]) => {
            const isFullAccess = module === "*";
            const moduleIds = perms.map((p) => p.id);
            const allModuleSelected = moduleIds.every(
              (id) => isWildcardActive || formData.permissions.includes(id),
            );

            return (
              <div
                key={module}
                className="bg-white rounded-lg border border-gray-100 p-3"
              >
                {/* Module header with select-all toggle */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    {isFullAccess
                      ? "⚡ Full Access"
                      : module.replace(/_/g, " ")}
                  </span>
                  {/* ✅ Per-module select all */}
                  {!isFullAccess && (
                    <button
                      type="button"
                      onClick={() => toggleModule(perms)}
                      className="text-xs text-blue-500 hover:underline"
                    >
                      {allModuleSelected ? "Deselect all" : "Select all"}
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  {perms.map((perm) => {
                    const checked =
                      isWildcardActive ||
                      formData.permissions.includes(perm.id);
                    return (
                      <label
                        key={perm.id}
                        className={`flex items-center gap-2 text-sm px-2 py-1 rounded cursor-pointer transition-colors ${
                          checked
                            ? "text-blue-700 bg-blue-50"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          // ✅ Allow unchecking individual when wildcard is active
                          onChange={() => {
                            if (perm.permission_key === "*.*") {
                              setFormData({
                                ...formData,
                                permissions: formData.permissions.includes(
                                  perm.id,
                                )
                                  ? []
                                  : permissions.map((p) => p.id),
                              });
                            } else {
                              // If wildcard was active, deactivate it and select all except this
                              if (isWildcardActive) {
                                const wildcardId = permissions.find(
                                  (p) => p.permission_key === "*.*",
                                )?.id;
                                setFormData({
                                  ...formData,
                                  permissions: permissions
                                    .map((p) => p.id)
                                    .filter(
                                      (id) =>
                                        id !== wildcardId && id !== perm.id,
                                    ),
                                });
                              } else {
                                togglePermission(perm.id);
                              }
                            }
                          }}
                          className="accent-blue-500"
                        />
                        <span className="capitalize">
                          {perm.permission_key === "*.*"
                            ? "All Permissions"
                            : perm.action}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          buttonName={
            disabled ? "Saving..." : isEdit ? "Update Role" : "Save Role"
          }
          buttonType="save"
          type="submit"
          disabled={disabled}
        />
        {isEdit && (
          <Button buttonName="Cancel" buttonType="cancel" onClick={onCancel} />
        )}
      </div>
    </form>
  );
};

export default AddRoleForm;
