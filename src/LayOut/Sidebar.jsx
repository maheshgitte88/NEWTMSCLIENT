import { jwtDecode } from "jwt-decode";
import React, { useState } from "react";
import { Link } from "react-router-dom";
const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSubMenu, setShowSubMenu] = useState(false);

  // const user = JSON.parse(localStorage.getItem("user"));
  // const student = JSON.parse(localStorage.getItem("Student"));
  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  const toggleSubMenu = () => {
    setShowSubMenu(!showSubMenu);
  };

  return (
    <>
      <>
        <aside
          className={`bg-gray-800 text-white ${
            isOpen ? "w-48" : "w-12"
          } min-h-dvh min-h-lvh transition-width duration-300 ease-in-out`}
        >
          <div className="flex justify-between border-b items-center py-2 px-3">
            <button onClick={toggleSidebar} className="text-white text-xl">
              {isOpen ? (
                <i className="bi bi-arrow-left-square"></i>
              ) : (
                <i className="bi bi-arrow-right-square"></i>
              )}
            </button>
          </div>

          {isOpen ? (
            <>
              <nav className="h-full">
                {/* <Link
                    to="/user/dashboard/org"
                    className="block py-2 px-3 text-base hover:bg-orange-700 hover:text-white-700 hover:text-lg"
                  >
                    <i className="bi bi-building"></i> Organization
                  </Link>
                  <Link
                    to="/user/dashboard/Team"
                    className="block py-2 px-3 text-base hover:bg-orange-700 hover:text-white-700 hover:text-lg"
                  >
                    <i className="bi bi-people"></i> Team
                  </Link> */}
                {decoded.user_Roal === "Student" ? (
                  <>
                    <Link
                      to="/user/Ticket"
                      className="block py-2 px-3 text-base hover:bg-orange-700 hover:text-white-700 hover:text-lg"
                    >
                      <i className="bi bi-ticket"></i> Ticket
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/admin/home"
                      className="block py-2 px-3 text-base hover:bg-orange-700 hover:text-white-700 hover:text-lg"
                    >
                      <i className="bi bi-house fs-2 "></i> Home
                    </Link>

                    <Link
                      to="/user/Ticket"
                      className="block py-2 px-3 text-base hover:bg-orange-700 hover:text-white-700 hover:text-lg"
                    >
                      <i className="bi bi-ticket"></i> Ticket
                    </Link>
                  </>
                )}

                {/* <div
                    className="block py-2 px-3 text-base hover:bg-orange-700 hover:text-white-700 hover:text-lg"
                    onClick={toggleSubMenu}
                    // style={{ cursor: "pointer" }}
                  >
                    <div className="flex  justify-between">
                      <i className="bi bi-house fs-2"> Menu</i>
                      {showSubMenu ? (
                        <>
                          <i className="bi bi-chevron-up"></i>
                        </>
                      ) : (
                        <>
                          <i className="bi bi-chevron-down"></i>
                        </>
                      )}
                    </div>
                  </div> */}

                {/* {showSubMenu && (
                    <div className="ml-4">
                      <Link
                        to="/user/dashboard/Reply"
                        className="block py-2 px-4 text-sm hover:bg-orange-700 hover:text-white-700 hover:text-lg"
                      >
                        <i className="bi bi-ticket"></i> Reply
                      </Link>
                      <Link
                        to="/user/dashboard/Ticket"
                        className="block py-2 px-4 text-sm hover:bg-orange-700 hover:text-white-700 hover:text-lg"
                      >
                        <i className="bi bi-ticket"></i> Ticket2
                      </Link>
                    </div>
                  )} */}
              </nav>
            </>
          ) : (
            <>
              <nav className="h-full">
                {/* <Link
                    to="/user/dashboard/Org"
                    className="block py-2 px-3 text-xl hover:bg-orange-700 hover:text-white-700 hover:text-2xl"
                  >
                    <i className="bi bi-building"></i>
                  </Link>
                  <Link
                    to="/user/dashboard/Team"
                    className="block py-2 px-3 text-xl hover:bg-orange-700 hover:text-white-700 hover:text-2xl"
                  >
                    <i className="bi bi-people"></i>
                  </Link> */}

                {decoded.user_Roal === "Student" ? (
                  <>
                    <Link
                      to="/user/Ticket"
                      className="block py-2 px-3 text-xl hover:bg-orange-700 hover:text-white-700 hover:text-2xl"
                    >
                      <i className="bi bi-ticket"></i>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/admin/home"
                      className="block py-2 px-3 text-xl hover:bg-orange-700 hover:text-white-700 hover:text-2xl"
                    >
                      <i className="bi bi-house"></i>
                    </Link>
                    <Link
                      to="/user/Ticket"
                      className="block py-2 px-3 text-xl hover:bg-orange-700 hover:text-white-700 hover:text-2xl"
                    >
                      <i className="bi bi-ticket"></i>
                    </Link>
                  </>
                )}

                {/* <div
                    className="block py-2 px-3 text-base flex justify-around "
                    onClick={toggleSubMenu}
                    style={{ cursor: "pointer" }}
                  >
                    <i className="bi bi-chevron-down"></i>
                  </div>

                  {showSubMenu && (
                    <div className="ml-4">
                      <Link
                        to="/user/dashboard/Reply"
                        className="block py-2 px-2 text-sm hover:bg-orange-700 hover:text-white-700 hover:text-2xl"
                      >
                        <i className="bi bi-ticket"></i>
                      </Link>
                      <Link
                        to="/user/dashboard/Ticket"
                        className="block py-2 px-2 text-sm hover:bg-orange-700 hover:text-white-700 hover:text-2xl"
                      >
                        <i className="bi bi-ticket"></i>
                      </Link>
                    </div>
                  )} */}
              </nav>
            </>
          )}
        </aside>
      </>
    </>
  );
};

export default Sidebar;
