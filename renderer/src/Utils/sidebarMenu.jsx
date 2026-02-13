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
    path: "/",
    icon: <HomeIcon className="w-4 h-4" />,
  },
  {
    label: "Masters",
    icon: <HiOutlineDatabase className="w-4 h-4" />,
    children: [
      { label: "Items", path: "/add-item" },
      { label: "Sizes", path: "/size" },
      { label: "Discounts", path: "/discounts" },
    ],
  },
  {
    label: "Vendor",
    icon: <IoStorefrontOutline className="w-4 h-4" />,
    children: [
      { label: "Create Vendor", path: "/vendor/add-vendor" },
      { label: "Manage Vendor", path: "/vendor/manage-vendor" },
    ],
  },
  {
    label: "Customer",
    icon: <IoPeopleOutline className="w-4 h-4" />,
    children: [{ label: "Create Customer", path: "/customer" }],
  },
  {
    label: "Sales",
    icon: <IoReceiptOutline className="w-4 h-4" />,
    children: [
      { label: "Generate Bill", path: "/billing/generate-bill" },
      { label: "Sales Bill", path: "/billing/sales-bill" },
    ],
  },
  {
    label: "Purchase",
    icon: <HiOutlineShoppingCart className="w-4 h-4" />,
    children: [
      {
        label: "Purchase Management",
        path: "/purchase",
      },
    ],
  },
  {
    label: "Label",
    icon: <HiOutlineTag className="w-4 h-4" />,
    children: [{ label: "Generate Label", path: "/label/generate-label" }],
  },
  {
    label: "Users",
    icon: <UserCircleIcon className="w-4 h-4" />,
    children: [
      {
        label: "User Management",
        path: "/users",
      },
    ],
  },
  {
    label: "Settings",
    icon: <IoSettingsOutline className="w-4 h-4" />,
    children: [
      { label: "Company Details", path: "/setting/company-details" },
      { label: "User Profile", path: "/projects/link2" },
      { label: "Users Setting", path: "/projects/link3" },
      { label: "Document Settings", path: "/projects/link3" },
    ],
  },
];
