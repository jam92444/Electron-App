import { HomeIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import {
  HiOutlineDatabase,
  HiOutlineShoppingCart,
  HiOutlineTag,
} from "react-icons/hi";
import {
  IoPeopleOutline,
  IoReceiptOutline,
  IoSettingsOutline,
  IoStorefrontOutline,
} from "react-icons/io5";

export const menuItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    permission: "*.*",
    icon: <HomeIcon className="w-4 h-4" />,
  },
  {
    label: "Masters",
    icon: <HiOutlineDatabase className="w-4 h-4" />,
    children: [
      { label: "Items", path: "/add-item", permission: "items.view" },
      { label: "Sizes", path: "/size", permission: "size.view" },
      { label: "Discounts", path: "/discounts", permission: "discount.view" },
    ],
  },
  {
    label: "Vendor",
    icon: <IoStorefrontOutline className="w-4 h-4" />,
    children: [
      {
        label: "Create Vendor",
        path: "/vendor/add-vendor",
        permission: "vendor.create",
      },
      {
        label: "Manage Vendor",
        path: "/vendor/manage-vendor",
        permission: "vendor.view",
      },
    ],
  },
  {
    label: "Customer",
    icon: <IoPeopleOutline className="w-4 h-4" />,
    children: [
      {
        label: "Manage Customer",
        path: "/customer",
        permission: "customer.view",
      },
    ],
  },
  {
    label: "Sales",
    icon: <IoReceiptOutline className="w-4 h-4" />,
    children: [
      {
        label: "Generate Bill",
        path: "/billing/generate-bill",
        permission: "bill.create",
      },
      {
        label: "Sales Bill",
        path: "/billing/sales-bill",
        permission: "bill.view",
      },
    ],
  },
  {
    label: "Purchase",
    icon: <HiOutlineShoppingCart className="w-4 h-4" />,
    children: [
      {
        label: "Purchase Management",
        path: "/purchase",
        permission: "purchase.view",
      },
    ],
  },
  {
    label: "Label",
    icon: <HiOutlineTag className="w-4 h-4" />,
    children: [
      {
        label: "Generate Label",
        path: "/label/generate-label",
        permission: "label.view",
      },
    ],
  },
  {
    label: "Users",
    icon: <UserCircleIcon className="w-4 h-4" />,
    children: [
      {
        label: "User Management",
        path: "/users",
        permission: "user.view",
      },
    ],
  },
  {
    label: "Settings",
    icon: <IoSettingsOutline className="w-4 h-4" />,
    children: [
      {
        label: "Company Details",
        path: "/setting/company-details",
        permission: "company_setting.view",
      },
      { label: "User Profile", path: "/users/profile" },
      // { label: "Document Settings", path: "/projects/link3" },
      {
        label: "Create Role",
        path: "/setting/config-permission",
        permission: "role.view",
      },
    ],
  },
];
