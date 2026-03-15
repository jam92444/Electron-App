import { PencilIcon } from "@heroicons/react/24/outline";
import Button from "../../../components/ReuseComponents/Button";
import Modal from "../../../components/ReuseComponents/Modal";
import { useState } from "react";

const ViewAllUsers = ({ users, onEdit, canUpdate }) => {
  const [accessModal, setAccessModal] = useState(null);

  const handleEditClick = (index) => {
    if (!canUpdate) {
      setAccessModal({
        title: "Access Denied",
        message: "You do not have permission to update users.",
      });
      return;
    }
    onEdit(index);
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <h2 className="text-md font-semibold text-gray-800 mb-4">All Users</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-orange-100 text-sm">
            <tr className="text-white">
              <th className="border px-3 py-2">Username</th>
              <th className="border px-3 py-2">Full Name</th>
              <th className="border px-3 py-2">Email</th>
              <th className="border px-3 py-2">Role</th>
              <th className="border px-3 py-2">Status</th>
              <th className="border px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id} className="text-sm text-center">
                <td className="border px-3 py-2">{user.username}</td>
                <td className="border px-3 py-2">{user.full_name}</td>
                <td className="border px-3 py-2">{user.email}</td>
                <td className="border px-3 py-2 capitalize">{user.role_name}</td>
                <td className="border px-3 py-2">{user.status}</td>
                <td className="border px-3 py-2">
                  <Button
                    buttonName={
                      <p className="flex mb-0 gap-2">
                        <PencilIcon className="w-4" /> Edit
                      </p>
                    }
                    buttonType="edit"
                    classname={canUpdate ? "bg-orange-100" : "bg-gray-100 opacity-50 cursor-not-allowed"}
                    onClick={() => handleEditClick(index)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {accessModal && (
        <Modal
          title={accessModal.title}
          message={accessModal.message}
          onClose={() => setAccessModal(null)}
          actions={
            <Button
              buttonName="OK"
              buttonType="save"
              onClick={() => setAccessModal(null)}
            />
          }
        />
      )}
    </div>
  );
};

export default ViewAllUsers;