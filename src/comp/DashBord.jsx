import React from "react";
import Sidebar from "../LayOut/Sidebar";
import Header from "../LayOut/Header";
import { Outlet } from "react-router-dom";

function DashBord() {
  return (
    <>
      <div className="flex bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
            <div className="container mx-auto px-1 py-1">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default DashBord;
