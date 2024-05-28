import { jwtDecode } from "jwt-decode";
import React, { useState } from "react";

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // const user = JSON.parse(localStorage.getItem("user"));
  // const student = JSON.parse(localStorage.getItem("Student"));
  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const handleLogout = () => {
    // Remove user from local storage
    if(token){
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("token");
    }
    setIsDropdownOpen(false);
    window.location.reload();
  };

  return (
    <header className="bg-white py-1 px-2 shadow flex justify-between items-center">
      <img
        style={{ width: "115px" }}
        src={
          "https://res.cloudinary.com/dtgpxvmpl/image/upload/v1702100329/mitsde_logo_vmzo63.png"
        }
        className="object-cover"
      />
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="text-gray-600 focus:outline-none"
        >
          <i className="bi bi-person-circle text-xl"></i>
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow">
            {decoded ? (
              <>
                <div className="px-2 py-1">
                  <p className="text-gray-700 text-xs font-medium">
                    Name: {decoded.user_Name}
                  </p>
                  <p className="text-gray-700 text-xs font-medium">
                    Location: {decoded.user_Email}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="px-2 py-1">
                  <p className="text-gray-700 text-xs font-medium">
                    Name: {student.StudentName}
                  </p>
                  <p className="text-gray-700 text-xs font-medium">
                    Reg No: {student.Registration_No}
                  </p>
                </div>
              </>
            )}

            <button
              onClick={handleLogout}
              className="bg-green-500 w-full text-white my-1 rounded hover:bg-green-600 text-gray-700 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
