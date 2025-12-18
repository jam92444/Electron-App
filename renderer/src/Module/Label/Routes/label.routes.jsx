import { withSuspense } from "../../../Router/withSuspense";
import { GenerateLabel } from "./label.lazyimports";

export const labelRoutes = [
  {
    path: "label/generate-label",
    element: withSuspense(<GenerateLabel />),
  },
];
