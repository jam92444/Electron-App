import { useEffect, useState } from "react";
import Button from "../../../components/ReuseComponents/Button";
import Modal from "../../../components/ReuseComponents/Modal";
import toast from "react-hot-toast";
import {
  getRoles,
  getPermissions,
  createRole,
  updateRole,
  deleteRole,
  getRolePermissions,
  setRolePermissions,
} from "../Services/settingService";
import AddRoleForm from "./AddRoleForm";
import ViewAllRoles from "./ViewAllRoles";

const AddRole = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [editingRole, setEditingRole] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [errorModal, setErrorModal] = useState({
    open: false,
    title: "",
    message: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const roleRes = await getRoles();
    const permRes = await getPermissions();

    if (roleRes.success) setRoles(roleRes.roles);
    if (permRes.success) setPermissions(permRes.permissions);
  };

  const handleEdit = async (index) => {
    const role = roles[index];
    const res = await getRolePermissions(role.id);

    setEditingRole({
      ...role,
      permissions: res.success ? res.permissions.map((p) => p.id) : [],
    });

    setEditingIndex(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

      toast.success("Role saved successfully!");
      await loadData();

      setEditingIndex(null);
      setEditingRole(null);
      return true;
    } catch (err) {
      setErrorModal({
        open: true,
        title: "Error",
        message: err.message || "Failed to save role",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (role) => {
    const res = await deleteRole(role.id);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success("Role deleted");
    loadData();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Role Management</h1>
        <p className="text-sm text-gray-600 italic">
          Create roles and assign permissions
        </p>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-6 mb-8">
        <h2 className="text-md font-semibold mb-4">
          {editingIndex !== null ? "Edit Role" : "Add New Role"}
        </h2>

        <AddRoleForm
          initialRole={editingRole}
          permissions={permissions}
          onSave={handleSave}
          disabled={saving}
          isEdit={editingIndex !== null}
          onCancel={() => {
            setEditingIndex(null);
            setEditingRole(null);
          }}
        />
      </div>

      <ViewAllRoles roles={roles} onEdit={handleEdit} onDelete={handleDelete} />

      {errorModal.open && (
        <Modal
          title={errorModal.title}
          message={errorModal.message}
          onClose={() => setErrorModal({ open: false })}
          actions={
            <Button
              buttonName="OK"
              buttonType="save"
              onClick={() => setErrorModal({ open: false })}
            />
          }
        />
      )}
    </div>
  );
};

export default AddRole;
