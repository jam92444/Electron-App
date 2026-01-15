import { lazy } from "react";

export const AddBillItemForm = lazy(() =>
  import("../Components/AddBillItemForm")
);
export const BillItemsTable = lazy(() =>
  import("../Components/BillItemsTable")
);
export const GenerateFinalAmount = lazy(() =>
  import("../Components/GenerateFinalAmount")
);
export const Basic44mmTemplate = lazy(() =>
  import("../Template/Basic44mmTemplate")
);
