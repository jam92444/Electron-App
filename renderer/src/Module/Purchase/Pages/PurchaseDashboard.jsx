import Button from "../../../components/ReuseComponents/Button";
import { useNavigate } from "react-router-dom";
import PurchasesListTable from "../Components/PurchaseListTable";

const PurchaseDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-4 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Purchase Management</h1>
        <Button
          buttonName="+ New Purchase"
          onClick={() => navigate("/purchase/new")}
        />
      </div>

      <PurchasesListTable onView={(row) => navigate(`/purchase/${row.id}`)} />
    </div>
  );
};

export default PurchaseDashboard;
