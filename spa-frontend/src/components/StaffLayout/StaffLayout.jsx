import React from "react";
import { Outlet } from "react-router-dom";
import StaffSidebar from "../StaffSidebar/StaffSidebar";
import "./StaffLayout.css";

function StaffLayout() {
  return (
    <div className="staff-layout">
      <StaffSidebar />

      <main className="staff-layout-main">
        <Outlet />
      </main>
    </div>
  );
}

export default StaffLayout;