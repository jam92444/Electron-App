import { PencilIcon } from "@heroicons/react/24/outline";
import Button from "../../../components/ReuseComponents/Button";

const ViewAllUsers = ({ users, onEdit }) => {
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
                <td className="border px-3 py-2">{user.status}</td>
                <td className="border px-3 py-2">
                  <Button
                    buttonName={
                      <p className=" flex mb-0 gap-2">
                        <PencilIcon className="w-4" /> Edit
                      </p>
                    }
                    buttonType="edit"
                    classname="bg-orange-100"
                    onClick={() => onEdit(index)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewAllUsers;
