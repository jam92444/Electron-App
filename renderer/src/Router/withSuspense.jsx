import { Suspense } from "react";
import Spinner from "../components/ReuseComponents/Spinner";

export const withSuspense = (element) => (
  <Suspense fallback={<Spinner />}>{element}</Suspense>
);
