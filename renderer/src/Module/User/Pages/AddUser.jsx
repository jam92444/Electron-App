import { useEffect, useState } from "react";
import Button from "../../../components/ReuseComponents/Button";
import Modal from "../../../components/ReuseComponents/Modal";
import toast from "react-hot-toast";
import { getUsers, insertUser, updateUser } from "../Services/user.services";
import AddUserForm from "./AddUserForm";
import ViewAllUsers from "./ViewAllUsers";
import { getRoles } from "../../Settings/Services/settingService";
import { useStateContext } from "../../../context/StateContext";

/* ---------------------------------------------------------
   MAIN COMPONENT
---------------------------------------------------------- */
const AddUser = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [errorModal, setErrorModal] = useState({
    open: false,
    title: "",
    message: "",
  });
  const [saving, setSaving] = useState(false);

  const { state } = useStateContext();
  const canCreate =
    state.user.permissions.includes("user.create") ||
    state.user.permissions.includes("*.*");
  const canView =
    state.user.permissions.includes("user.view") ||
    state.user.permissions.includes("*.*");
  const canUpdate =
    state.user.permissions.includes("user.update") ||
    state.user.permissions.includes("*.*");

  const loadUsers = async () => {
    try {
      const res = await getUsers();
      if (res.success) setUsers(res.users);
      else console.error(res.error);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (index) => {
    if (!canUpdate) {
      setErrorModal({
        open: true,
        title: "Access Denied",
        message: "You do not have permission to update users.",
      });
      return;
    }
    setEditingIndex(index);
    setEditingUser(users[index]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async (user, isEdit) => {
    if (!isEdit && !canCreate) {
      setErrorModal({
        open: true,
        title: "Access Denied",
        message: "You do not have permission to create users.",
      });
      return false;
    }

    if (saving) return false;
    setSaving(true);
    try {
      let result;
      if (isEdit) result = await updateUser(user);
      else result = await insertUser(user);

      if (!result.success) {
        setErrorModal({
          open: true,
          title: "Error",
          message:
            result.error === "USERNAME_EXISTS"
              ? "Username already exists. Please choose another."
              : result.error,
        });
        return false;
      }

      toast.success(result.message || "Saved successfully!");
      await loadUsers();
      setEditingIndex(null);
      setEditingUser(null);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingUser(null);
  };

  const loadRoles = async () => {
    try {
      const res = await getRoles();
      if (res.success) setRoles(res.roles);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (canView) loadUsers();
    loadRoles();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* ---------------- PAGE HEADER ---------------- */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">User Management</h1>
        <p className="text-sm text-gray-600 italic">
          Add, edit and manage system users with roles & status
        </p>
      </div>

      {/* ---------------- FORM CARD ---------------- */}
      {(canCreate || canUpdate) && (
        <div className="bg-white rounded-xl border shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-md font-semibold text-gray-800">
              {editingIndex !== null ? "Edit User" : "Add New User"}
            </h2>

            {editingIndex !== null && (
              <span className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">
                Editing Mode
              </span>
            )}
          </div>

          <AddUserForm
            initialUser={editingUser}
            users={users}
            roles={roles}
            onSave={handleSave}
            onCancel={handleCancelEdit}
            disabled={saving}
            isEdit={editingIndex !== null}
          />
        </div>
      )}

      {/* ---------------- TABLE CARD ---------------- */}
      {canView && (
        <div>
          <ViewAllUsers
            users={users}
            onEdit={handleEdit}
            reload={loadUsers}
            canUpdate={canUpdate}
          />
        </div>
      )}

      {/* ---------------- ERROR MODAL ---------------- */}
      {errorModal.open && (
        <Modal
          title={errorModal.title}
          message={errorModal.message}
          onClose={() => setErrorModal({ open: false, title: "", message: "" })}
          actions={
            <Button
              buttonName="OK"
              buttonType="save"
              onClick={() =>
                setErrorModal({ open: false, title: "", message: "" })
              }
            />
          }
        />
      )}
    </div>
  );
};

export default AddUser;