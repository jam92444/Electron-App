/* eslint-disable react-hooks/exhaustive-deps */
import classNames from "classnames";
import asset from "../Utils/asset";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { menuItems } from "../Utils/sidebarMenu";
import { IoIosArrowDown } from "react-icons/io";
import { RiLogoutCircleLine } from "react-icons/ri";
import { useStateContext } from "../context/StateContext";
import { LOGOUT, SET_TOKEN, USER_DATA } from "../context/reducer/actionTypes";
import {
  logoutUser,
  restoreSession,
} from "../Module/Auth/Services/auth.services";

const AppSidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null); // store which parent menu is open
  const { dispatch } = useStateContext();

  const handleLogout = async () => {
    try {
      // 🔐 tell main process to clear session
      await logoutUser();

      // 🧹 clear reducer state
      dispatch({ type: LOGOUT });

      // 🗑 clear localStorage persistence
      localStorage.removeItem("auth");

      // 📱 close sidebar if mobile
      if (window.innerWidth < 1024) {
        toggleSidebar();
      }

      // 🚀 navigate to login
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  // console.log("Hi");
  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  const handleMenuToggle = (label) => {
    // if the same menu is clicked, close it; otherwise open the new one
    setOpenMenu((prev) => (prev === label ? null : label));
  };

  return (
    <aside
      className={classNames(
        "fixed top-0 left-0 z-40 h-full w-52 transition-transform bg-gray-50 border-r   border",
        {
          "translate-x-0": isOpen,
          "-translate-x-full": !isOpen,
          "lg:translate-x-0": true,
        },
      )}
    >
      <div className="p-3 flex justify-between items-center mb-4">
        <div className="w-full content-center font-bold text-xl text-black ">
          <img src={asset.logo} className="h-12 ml-2 " />
        </div>
        <button onClick={toggleSidebar} className="lg:hidden text-xl ">
          ✖
        </button>
      </div>

      <nav className="overflow-y-auto p-2">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.label}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => handleMenuToggle(item.label)}
                    className={classNames(
                      "flex items-center justify-between w-full cursor-pointer px-2.5 py-2 text-gray-800 rounded-lg hover:bg-orange-100 hover:text-white ",
                      {
                        "bg-orange-100 text-white": openMenu === item.label,
                      },
                    )}
                  >
                    <span className="flex items-center gap-2 text-sm">
                      {item.icon}
                      {item.label}
                    </span>
                    <span
                      className={classNames("transition-transform", {
                        "rotate-180": openMenu === item.label,
                      })}
                    >
                      <IoIosArrowDown />
                    </span>
                  </button>

                  {openMenu === item.label && (
                    <ul className="ml-5 space-y-1 mt-1 bg-gray-300 rounded-lg">
                      {item.children.map((child) => (
                        <li
                          key={child.label}
                          className="cursor-pointer select-none"
                        >
                          <a
                            onClick={() => handleNavigation(child.path)}
                            className="block py-2 px-2.5 text-sm rounded-lg text-gray-800 hover:text-white hover:bg-orange-100"
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
                  className="flex items-center gap-2 py-2 px-2.5 text-sm rounded-lg hover:text-white hover:bg-orange-100  cursor-pointer"
                >
                  {item.icon}
                  {item.label}
                </a>
              )}
            </li>
          ))}
          <li
            onClick={() => {
              handleLogout();
              console.log("Cllicked");
            }}
            className="flex items-center absolute gap-2 mt-2 bottom-4 w-40 cursor-pointer hover:bg-red-500 hover:scale-95 transition-all ml-2 mx-auto my-0 bg-red-600 p-2 rounded text-white"
          >
            {" "}
            <RiLogoutCircleLine /> Logout
          </li>
        </ul>
      </nav>
    </aside>
  );
};

const AppLayout = () => {
  // const location = useLocation();

  // const getPageTitle = (pathname) => {
  //   const pathToTitle = {
  //     "/": "Dashboard",
  //     "/setting": "Settings",
  //     "/profile": "Profile",
  //     // Add more routes as needed
  //   };

  //   return pathToTitle[pathname] || "Dashboard";
  // };

  // const pageTitle = getPageTitle(location.pathname);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const { state, dispatch } = useStateContext();
  const userData = state.user;

  useEffect(() => {
    const restore = async () => {
      const result = await restoreSession();

      if (result.success) {
        dispatch({ type: USER_DATA, payload: result.user });
        dispatch({ type: SET_TOKEN, payload: "logged_in" });
      }
    };

    window.scrollTo(0, 0);
    restore();
    localStorage.removeItem("userData");
  }, []);

  console.log("User data ", state.user);

  return (
    <div className="min-h-screen bg-white ">
      {/* Mobile Toggle Button */}
      <div className="fixed z-40 lg:hidden p-4 w-full backdrop-blur-3xl bg-white/30  ">
        <button
          onClick={toggleSidebar}
          className="text-gray-600 text-2xl  focus:outline-none"
        >
          ☰
        </button>
      </div>

      {/* Sidebar */}
      <AppSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="lg:ml-52 transition-all duration-300 p-4 relative z-30">
        <div className=" px-4 py-3 absolute top-0 left-0 w-full hidden lg:flex items-center justify-end select-none">
          <div className="flex items-center bg-orange-100 border border-gray-200 rounded-full p-1.5 pe-3   w-fit float-end ">
            <img
              className="ms-1.5 inline-block size-6 rounded-full"
              src="https://images.unsplash.com/photo-1531927557220-a9e23c1e4794?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80"
              alt="Avatar"
            />
            <div className="ml-2 whitespace-nowrap text-sm font-semibold text-white">
              Hi, {userData?.full_name}
            </div>
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
