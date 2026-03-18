import { HomeIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import {
  HiOutlineCreditCard,
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
  // Dashboard
  {
    label: "Dashboard",
    path: "/dashboard",
    permission: "*.*",
    icon: <HomeIcon className="w-4 h-4" />,
  },

  // Masters
  {
    label: "Masters",
    icon: <HiOutlineDatabase className="w-4 h-4" />,
    children: [
      {
        label: "Items",
        path: "/items",
        permission: "items.view",
      },
      {
        label: "Sizes",
        path: "/sizes",
        permission: "size.view",
      },
      {
        label: "Discounts",
        path: "/discounts",
        permission: "discount.view",
      },
    ],
  },

  // Purchase & Vendor
  {
    label: "Purchase",
    icon: <HiOutlineShoppingCart className="w-4 h-4" />,
    children: [
      {
        label: "Purchase Management",
        path: "/purchase",
        permission: "purchase.view",
      },
      {
        label: "Vendors",
        path: "/vendor/manage-vendor",
        permission: "vendor.view",
      },
      {
        label: "Add Vendor",
        path: "/vendor/add-vendor",
        permission: "vendor.create",
      },
    ],
  },

  // Sales
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
        label: "Sales Bills",
        path: "/billing/sales-bill",
        permission: "bill.view",
      },
    ],
  },

  // Customers
  {
    label: "Customers",
    icon: <IoPeopleOutline className="w-4 h-4" />,
    children: [
      {
        label: "Customer Management",
        path: "/customer",
        permission: "customer.view",
      },
    ],
  },

  // Expenses
  {
    label: "Expenses",
    icon: <HiOutlineCreditCard className="w-4 h-4" />,
    children: [
      {
        label: "Expense Management",
        path: "/expense",
        permission: "expense.view",
      },
    ],
  },

  // Labels
  {
    label: "Labels",
    icon: <HiOutlineTag className="w-4 h-4" />,
    children: [
      {
        label: "Generate Label",
        path: "/label/generate-label",
        permission: "label.view",
      },
    ],
  },

  // Users
  {
    label: "Users",
    icon: <UserCircleIcon className="w-4 h-4" />,
    children: [
      {
        label: "User Management",
        path: "/users",
        permission: "user.view",
      },
      {
        label: "User Profile",
        path: "/users/profile",
      },
    ],
  },

  // Settings
  {
    label: "Settings",
    icon: <IoSettingsOutline className="w-4 h-4" />,
    children: [
      {
        label: "Company Details",
        path: "/setting/company-details",
        permission: "company_setting.view",
      },
      {
        label: "Role Management",
        path: "/setting/config-permission",
        permission: "role.view",
      },
    ],
  },
];