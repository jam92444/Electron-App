import { withSuspense } from "../../../Router/withSuspense";
import { Customer } from "./customer.lazyimports";

export const CustomerRoutes = [
    {
        path:'customer',
        element:withSuspense(<Customer/>)
    }
]