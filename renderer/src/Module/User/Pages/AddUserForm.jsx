/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import Button from "../../../components/ReuseComponents/Button";

const AddUserForm = ({
  initialUser,
  onSave,
  onCancel,
  disabled,
  isEdit,
  roles,
}) => {
  const [formData, setFormData] = useState({
    id: null,
    username: "",
    password: "",
    full_name: "",
    email: "",
    status: "Active",
    role_id: "",
  });

  useEffect(() => {
    if (initialUser) {
      setFormData({
        ...initialUser,
        password: "", // never prefill password
      });
    }
  }, [initialUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.trim()) return;
    if (!isEdit && !formData.password.trim()) return;

    const success = await onSave(formData, isEdit);
    if (success && !isEdit) {
      onCancel;
      setFormData({
        id: null,
        username: "",
        password: "",
        full_name: "",
        email: "",
        status: "Active",
      });
    }
  };

  const handleCancel = async () => {
    await onCancel();
    setFormData({
      id: null,
      username: "",
      password: "",
      full_name: "",
      email: "",
      status: "Active",
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <div>
        <label className="text-sm font-medium">Username *</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          disabled={disabled}
          className="w-full border rounded px-3 py-2 mt-1"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">
          {isEdit ? "New Password" : "Password *"}
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          disabled={disabled}
          className="w-full border rounded px-3 py-2 mt-1"
          placeholder={isEdit ? "Leave blank to keep current password" : ""}
        />
        <small>{formData.password}</small>
      </div>

      <div>
        <label className="text-sm font-medium">Full Name</label>
        <input
          type="text"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          disabled={disabled}
          className="w-full border rounded px-3 py-2 mt-1"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={disabled}
          className="w-full border rounded px-3 py-2 mt-1"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          disabled={disabled}
          className="w-full border rounded px-3 py-2 mt-1"
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium">Role *</label>
        <select
          name="role_id"
          value={formData.role_id}
          onChange={handleChange}
          disabled={disabled || formData.username === "superadmin"}
          className="w-full border rounded px-3 py-2 mt-1"
          required
        >
          <option value="">Select Role</option>
          {roles
            .filter((role) => role.name !== "super_admin") // prevent selecting super_admin role
            .map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
        </select>
      </div>
      <div className="md:col-span-2 flex gap-3 mt-4">
        <Button
          buttonName={isEdit ? "Update User" : "Save User"}
          buttonType="save"
          type="submit"
          disabled={disabled}
        />
        {isEdit && (
          <Button
            buttonName="Cancel"
            buttonType="cancel"
            type="button"
            onClick={handleCancel}
          />
        )}
      </div>
    </form>
  );
};

export default AddUserForm;
