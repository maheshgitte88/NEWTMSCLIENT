import React from "react";
import StudentTicket from "./TicketTypes/StudentTicket";
import { jwtDecode } from "jwt-decode";
import LeadTransfer from "./TicketTypes/LeadTransfer";

function Ticket() {

  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  console.log(decoded, 19);


  return (
    <>
      {decoded.user_Roal === "Employee" ? (
        <>
          <LeadTransfer />
        </>
      ) : (
        <>
          <StudentTicket />
        </>
      )}
    </>
  );
}

export default Ticket;
