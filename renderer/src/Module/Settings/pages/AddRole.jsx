import { useEffect, useState } from "react";
import Button from "../../../components/ReuseComponents/Button";
import Modal from "../../../components/ReuseComponents/Modal";
import toast from "react-hot-toast";
import {
  getRoles, getPermissions, createRole, updateRole,
  deleteRole, getRolePermissions, setRolePermissions,
} from "../Services/settingService";
import AddRoleForm from "./AddRoleForm";
import ViewAllRoles from "./ViewAllRoles";

const AddRole = () => {
  const [roles, setRoles]           = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [editingRole, setEditingRole] = useState(null);
  const [saving, setSaving]         = useState(false);
  const [loading, setLoading]       = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null); // ✅ replaces errorModal for delete confirm
  const [errorModal, setErrorModal] = useState({ open: false, title: "", message: "" });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [roleRes, permRes] = await Promise.all([getRoles(), getPermissions()]);
      if (roleRes.success)  setRoles(roleRes.roles);
      if (permRes.success)  setPermissions(permRes.permissions);
    } catch {
      toast.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (role) => {
    const res = await getRolePermissions(role.id);
    setEditingRole({
      ...role,
      permissions: res.success ? res.permissions.map((p) => p.id) : [],
    });
    // ✅ No window.scrollTo — form is always visible at top
  };

  const handleSave = async (roleData, isEdit) => {
    if (saving) return false;
    setSaving(true);
    try {
      let roleId;
      if (isEdit) {
        const res = await updateRole(roleData);
        if (!res.success) throw new Error(res.error);
        roleId = roleData.id;
      } else {
        const res = await createRole(roleData);
        if (!res.success) throw new Error(res.error);
        roleId = res.roleId;
      }

      await setRolePermissions(roleId, roleData.permissions);
      toast.success(isEdit ? "Role updated!" : "Role created!");
      await loadData();
      setEditingRole(null);
      return true;
    } catch (err) {
      setErrorModal({ open: true, title: "Error", message: err.message || "Failed to save role" });
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ✅ Show confirm modal before deleting
  const handleDeleteRequest = (role) => setDeleteTarget(role);

  const handleDeleteConfirm = async () => {
    const res = await deleteRole(deleteTarget.id);
    setDeleteTarget(null);
    if (!res.success) { toast.error(res.error); return; }
    toast.success("Role deleted");
    loadData();
  };

  const isEditing = editingRole !== null; // ✅ no redundant editingIndex

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Role Management</h1>
        <p className="text-sm text-gray-500">Create roles and assign permissions to control access.</p>
      </div>

      {/* Form Card */}
      <div className={`bg-white rounded-xl border shadow-sm p-6 mb-6 transition-all ${
        isEditing ? "border-blue-300 ring-1 ring-blue-100" : "border-gray-200"
      }`}>
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          {isEditing ? `Editing: ${editingRole.name}` : "Add New Role"}
        </h2>
        <AddRoleForm
          initialRole={editingRole}
          permissions={permissions}
          onSave={handleSave}
          disabled={saving}
          isEdit={isEditing}
          onCancel={() => setEditingRole(null)}
        />
      </div>

      {/* Roles Table */}
      <ViewAllRoles
        roles={roles}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
      />

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <Modal
          title="Delete Role"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This cannot be undone.`}
          onClose={() => setDeleteTarget(null)}
          actions={
            <div className="flex gap-2 justify-end">
              <Button buttonName="Cancel" onClick={() => setDeleteTarget(null)} />
              <Button buttonName="Delete" buttonType="delete" onClick={handleDeleteConfirm} />
            </div>
          }
        />
      )}

      {/* Error Modal */}
      {errorModal.open && (
        <Modal
          title={errorModal.title}
          message={errorModal.message}
          onClose={() => setErrorModal({ open: false })}
          actions={
            <Button buttonName="OK" buttonType="save" onClick={() => setErrorModal({ open: false })} />
          }
        />
      )}
    </div>
  );
};

export default AddRole;