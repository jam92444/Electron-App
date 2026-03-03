import Button from "../../../components/ReuseComponents/Button";

const ViewAllRoles = ({ roles, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-6 ">
      <h2 className="text-md font-semibold mb-4">All Roles</h2>
      <div className="overflow-x-scroll">
        <table className="max-w-full border text-sm ">
          <thead className="bg-orange-100 text-white">
            <tr>
              <th className="border px-3 py-2">Name</th>
              <th className="border px-3 py-2">Description</th>
              <th className="border px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role, index) => (
              <tr key={role.id} className="text-center">
                <td className="border px-3 py-2 min-w-40">{role.name}</td>
                <td className="border px-3 py-2 min-w-40">
                  {role.description}
                </td>
                <td className="border px-3 py-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                  <Button
                    buttonName="Edit"
                    buttonType="edit"
                    classname="bg-orange-100"
                    onClick={() => onEdit(index)}
                  />
                  {role.name !== "super_admin" && (
                    <Button
                      buttonName="Delete"
                      buttonType="delete"
                      onClick={() => onDelete(role)}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewAllRoles;
