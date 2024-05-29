import React from "react";
import AdminTicket from "./Tables/AdminTicket";
import DepartmentsTickets from "./Tables/DepartmentsTickets";
import { jwtDecode } from "jwt-decode";

function Home() {
  const token = localStorage.getItem("token");

  const decoded = jwtDecode(token);

  return (
    <>
      {" "}
      <div className="container mx-auto flex flex-col sm:flex-row text-sm">
        <div className="sm:w-full">
          {decoded.DepartmentID === 2 ? (
            <>
              <AdminTicket />
            </>
          ) : (
            <>
              <DepartmentsTickets />
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Home;
