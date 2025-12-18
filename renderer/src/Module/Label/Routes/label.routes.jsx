import { GenerateLabel } from "../../../Router/lazyImports";
import { withSuspense } from "../../../Router/withSuspense";

export const labelRoutes = [
  {
    path: "label/generate-label",
    element: withSuspense(<GenerateLabel />),
  },
];
