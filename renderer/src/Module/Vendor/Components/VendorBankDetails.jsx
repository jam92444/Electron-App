import Input from "../../../components/ReuseComponents/Input";

const VendorBankDetails = ({ vendorData, setVendorData }) => {
  return (
    <div className=" p-4 rounded-lg ">
      <h2 className="font-semibold mb-3 text-lg">Bank Details</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Input
          label="Bank Name"
          value={vendorData.bankName}
          onChange={(e) =>
            setVendorData({ ...vendorData, bankName: e.target.value })
          }
        />

        <Input
          label="Account Holder Name"
          value={vendorData.accountHolder}
          onChange={(e) =>
            setVendorData({ ...vendorData, accountHolder: e.target.value })
          }
        />

        <Input
          label="Account Number"
          value={vendorData.accountNumber}
          onChange={(e) =>
            setVendorData({ ...vendorData, accountNumber: e.target.value })
          }
        />

        <Input
          label="IFSC Code"
          value={vendorData.ifsc}
          onChange={(e) =>
            setVendorData({ ...vendorData, ifsc: e.target.value })
          }
        />

        <Input
          label="UPI ID"
          value={vendorData.upi}
          onChange={(e) =>
            setVendorData({ ...vendorData, upi: e.target.value })
          }
        />

        <Input
          label="Payment Terms"
          value={vendorData.paymentTerms}
          onChange={(e) =>
            setVendorData({ ...vendorData, paymentTerms: e.target.value })
          }
        />
      </div>
    </div>
  );
};

export default VendorBankDetails;
