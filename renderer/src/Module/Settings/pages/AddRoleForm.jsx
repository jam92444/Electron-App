/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import Button from "../../../components/ReuseComponents/Button";

const AddRoleForm = ({
  initialRole,
  permissions,
  onSave,
  disabled,
  isEdit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    description: "",
    permissions: [],
  });

  useEffect(() => {
    if (initialRole) {
      setFormData(initialRole);
    }
  }, [initialRole]);

  const togglePermission = (id) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(id)
        ? prev.permissions.filter((p) => p !== id)
        : [...prev.permissions, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formData, isEdit);
    setFormData({
      id: null,
      name: "",
      description: "",
      permissions: [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Role Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={disabled}
          required
          className="w-full border rounded px-3 py-2 mt-1"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          disabled={disabled}
          className="w-full border rounded px-3 py-2 mt-1"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Permissions</label>

        <div className="mt-3 space-y-4 border rounded p-4 max-h-80 overflow-y-auto">
          {Object.entries(
            permissions.reduce((acc, perm) => {
              const [module, action] = perm.permission_key.split(".");

              if (!acc[module]) acc[module] = [];
              acc[module].push({ ...perm, action });

              return acc;
            }, {}),
          ).map(([module, perms]) => {
            const isWildcard = module === "*";
            const wildcardPermission = perms.find(
              (p) => p.permission_key === "*.*",
            );

            const isWildcardChecked =
              wildcardPermission &&
              formData.permissions.includes(wildcardPermission.id);

            return (
              <div key={module} className="border-b pb-3">
                {/* Module Title */}
                <div className="font-semibold text-gray-700 capitalize mb-2">
                  {module === "*" ? "Full Access" : module.replace("_", " ")}
                </div>

                <div className="flex flex-wrap gap-6">
                  {perms.map((perm) => (
                    <label
                      key={perm.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={
                          isWildcardChecked ||
                          formData.permissions.includes(perm.id)
                        }
                        onChange={() => {
                          if (perm.permission_key === "*.*") {
                            // Toggle full access
                            if (formData.permissions.includes(perm.id)) {
                              setFormData({ ...formData, permissions: [] });
                            } else {
                              setFormData({
                                ...formData,
                                permissions: permissions.map((p) => p.id),
                              });
                            }
                          } else {
                            togglePermission(perm.id);
                          }
                        }}
                      />
                      {perm.permission_key === "*.*"
                        ? "All Permissions"
                        : perm.action}
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <Button
          buttonName={isEdit ? "Update Role" : "Save Role"}
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
