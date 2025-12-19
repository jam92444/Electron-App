import {
  HomeIcon,
  UserCircleIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { HiOutlineTag } from "react-icons/hi";
import { IoSettingsOutline, IoStorefrontOutline } from "react-icons/io5";

export const menuItems = [
  {
    label: "Dashboard",
    path: "/",
    icon: <HomeIcon className="w-4 h-4" />,
  },
  {
    label: "Masters",
    icon: <UserCircleIcon className="w-4 h-4" />,
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
      { label: "Vendor", path: "/vendor/add-vendor" },
    ],
  },
  {
    label: "Sales",
    icon: <Squares2X2Icon className="w-4 h-4" />,
    children: [
      { label: "Generate Bill", path: "/billing/generate-bill" },
      { label: "Sales Bill", path: "billing/sales-bill" },
    ],
  },
  {
    label: "Label",
    icon: <HiOutlineTag className="w-4 h-4" />,
    children: [{ label: "Generate Label", path: "/label/generate-label" }],
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
