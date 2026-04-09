/* eslint-disable react-hooks/exhaustive-deps */
import classNames from "classnames";
import asset from "../Utils/asset";
import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { menuItems } from "../Utils/sidebarMenu";
import { IoIosArrowDown } from "react-icons/io";
import { RiLogoutCircleLine } from "react-icons/ri";
import { useStateContext } from "../context/StateContext";
import { LOGOUT, SET_TOKEN, USER_DATA } from "../context/reducer/actionTypes";
import {
  logoutUser,
  restoreSession,
} from "../Module/Auth/Services/auth.services";

// ─── Helpers ────────────────────────────────────────────────────────────────
const getInitials = (name) =>
  name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?";

// ─── Sidebar ────────────────────────────────────────────────────────────────
const AppSidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);
  const { state, dispatch } = useStateContext();
  const userPermissions = state?.user?.permissions || [];

  // Determine if user is admin (or has full permissions)
  const isAdmin =
    userPermissions.includes("*.*") || state.user?.role === "super_admin";

  const hasPermission = (permission) => {
    if (!permission) return true; // no restriction
    if (isAdmin) return true; // admin sees everything
    return userPermissions.includes(permission);
  };

  // Filter menu items based on permissions
  const filteredMenu = menuItems
    .map((item) => {
      if (item.children) {
        const filteredChildren = item.children.filter((child) =>
          hasPermission(child.permission),
        );
        return filteredChildren.length > 0
          ? { ...item, children: filteredChildren }
          : null;
      }
      return hasPermission(item.permission) ? item : null;
    })
    .filter(Boolean);
  const handleLogout = async () => {
    try {
      await logoutUser();
      dispatch({ type: LOGOUT });
      localStorage.removeItem("auth");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) toggleSidebar();
  };

  const isActiveChild = (children) =>
    children?.some((child) => location.pathname === child.path);

  // Auto-open parent if a child is active
  useEffect(() => {
    filteredMenu.forEach((item) => {
      if (item.children && isActiveChild(item.children)) {
        setOpenMenu(item.label);
      }
    });
  }, [location.pathname]);

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={classNames(
          "fixed top-0 left-0 z-40 h-full w-52 flex flex-col transition-transform bg-gray-50 border-r border-gray-200",
          {
            "translate-x-0": isOpen,
            "-translate-x-full": !isOpen,
            "lg:translate-x-0": true,
          },
        )}
      >
        {/* Logo */}
        <div className="p-3 flex justify-between items-center mb-2 flex-shrink-0">
          <img src={asset.logo} className="h-12 ml-2" alt="Logo" />
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-gray-500 hover:text-gray-800 text-xl"
          >
            ✖
          </button>
        </div>

        {/* Menu — grows to fill space */}
        <nav className="flex-1 overflow-y-auto px-2 pb-2">
          <ul className="space-y-1">
            {filteredMenu.map((item) => (
              <li key={item.label}>
                {item.children ? (
                  <div>
                    <button
                      onClick={() =>
                        setOpenMenu((prev) =>
                          prev === item.label ? null : item.label,
                        )
                      }
                      className={classNames(
                        "flex items-center justify-between w-full px-2.5 py-2 text-sm text-gray-700 rounded-lg hover:bg-orange-100 hover:text-white transition-colors",
                        {
                          "bg-orange-100 text-white":
                            openMenu === item.label ||
                            isActiveChild(item.children),
                        },
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {item.icon}
                        {item.label}
                      </span>
                      <span
                        className={classNames(
                          "transition-transform duration-200",
                          {
                            "rotate-180": openMenu === item.label,
                          },
                        )}
                      >
                        <IoIosArrowDown />
                      </span>
                    </button>

                    {openMenu === item.label && (
                      <ul className="ml-5 space-y-1 mt-1 bg-gray-200 rounded-lg overflow-hidden">
                        {item.children.map((child) => (
                          <li key={child.label}>
                            <a
                              onClick={() => handleNavigation(child.path)}
                              className={classNames(
                                "block py-2 px-2.5 text-sm rounded-lg cursor-pointer transition-colors",
                                location.pathname === child.path
                                  ? "bg-orange-400 text-white font-semibold"
                                  : "text-gray-700 hover:bg-orange-100 hover:text-white",
                              )}
                            >
                              {child.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <a
                    onClick={() => handleNavigation(item.path)}
                    className={classNames(
                      "flex items-center gap-2 py-2 px-2.5 text-sm rounded-lg cursor-pointer transition-colors",
                      location.pathname === item.path
                        ? "bg-orange-400 text-white font-semibold"
                        : "text-gray-700 hover:bg-orange-100 hover:text-white",
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout — pinned to bottom naturally via flex */}
        <div className="flex-shrink-0 p-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full cursor-pointer bg-red-600 hover:bg-red-700 active:scale-95 transition-all p-2 rounded-lg text-white text-sm font-medium"
          >
            <RiLogoutCircleLine size={16} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

// ─── Layout ─────────────────────────────────────────────────────────────────
const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const { state, dispatch } = useStateContext();
  const navigate = useNavigate();
  const userData = state.user;

  useEffect(() => {
    const restore = async () => {
      try {
        const result = await restoreSession();

        if (result.success) {
          dispatch({ type: USER_DATA, payload: result.user });
          dispatch({ type: SET_TOKEN, payload: "logged_in" });
        } else {
          // Session invalid — send to login
          navigate("/login");
        }
      } catch (error) {
        console.error("Session restore failed:", error);
        navigate("/login");
      } finally {
        setIsRestoring(false);
      }
    };

    window.scrollTo(0, 0);
    restore();
  }, []);

  // Show a full-screen loader while session is being restored
  // to prevent layout flash with missing user data
  if (isRestoring) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile topbar */}
      <div className="fixed z-40 lg:hidden p-4 w-full backdrop-blur-md bg-white/60 border-b border-gray-100">
        <button
          onClick={toggleSidebar}
          className="text-gray-600 text-2xl focus:outline-none"
        >
          ☰
        </button>
      </div>

      {/* Sidebar */}
      <AppSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main content */}
      <div className="lg:ml-52 transition-all duration-300 p-4 relative z-30">
        {/* Desktop topbar */}
        <div className="px-4 py-3 absolute top-0 left-0 w-full hidden lg:flex items-center justify-end select-none">
          <div className="flex items-center bg-orange-400 border border-orange-300 rounded-full p-1.5 pe-3 w-fit gap-2">
            {/* Initials avatar — no hardcoded image */}
            <div className="w-7 h-7 rounded-full bg-white text-orange-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {getInitials(userData?.full_name)}
            </div>
            <span className="whitespace-nowrap capitalize text-sm font-semibold text-white">
              Hi, {userData?.username}
            </span>
          </div>
        </div>

        <div className="mt-12 z-10 overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
