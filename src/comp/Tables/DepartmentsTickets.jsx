import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  claimAdminTicket,
  getAdminAssignedTicket,
  getAdminTicketClaimed,
  getAdminTicketFromOtherDep,
  updateAdminTicket,
  updateForAdminOtherDepTicket,
  updateForAdminTicket,
} from "../../reduxToolkit/features/AdminSlice";
import { io } from "socket.io-client";
import Resolution from "./Reply/Resolution";
import Transferred from "./Reply/Transferred";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import moment from "moment";

function DepartmentsTickets() {
  const socket = useMemo(() => io("https://13.235.240.117:2000"), []);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [closedTickets, setClosedTickets] = useState([]);
  const [resolvedTickets, setResolvedTickets] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [notificationPermission, setNotificationPermission] =
    useState("default");

  const [timeUpdates, setTimeUpdates] = useState([]);

  const [activeTable, setActiveTable] = useState("AdminTickets");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const handleTicketClick = async (ticket) => {
    setSelectedTicket(ticket);
  };

  const { userInfo } = useSelector((state) => state.user);
  const { AdminTickets, ResFromOtherDepTickets, AdminClaimedTickets, loading } =
    useSelector((state) => state.AdminTickets);

  const dispatch = useDispatch();

  const token = localStorage.getItem("token");

  const decoded = jwtDecode(token);
  useEffect(() => {
    if (userInfo) {
      const dpId = userInfo.DepartmentID;
      const SubDapId = userInfo.SubDepartmentID;
      dispatch(
        getAdminAssignedTicket({
          departmentId: dpId,
          SubDepartmentId: SubDapId,
        })
      );

      dispatch(
        getAdminTicketFromOtherDep({
          departmentId: dpId,
          SubDepartmentId: SubDapId,
        })
      );

      dispatch(
        getAdminTicketClaimed({
          user_id: decoded.user_id,
        })
      );
    }
  }, [userInfo]);
  console.log(userInfo, 49);

  useEffect(() => {
    socket.on("updatedDeptTicketChat", (data) => {
      console.log("Ticket created successfully:", data);
      showTicketNotification(data);
      dispatch(updateAdminTicket(data));
    });

    socket.on("updatedticketData", (data) => {
      console.log("Ticket update 62  :", data);
      const { TransferredToDepartmentID } = data;
      if (TransferredToDepartmentID > 0) {
        dispatch(updateForAdminOtherDepTicket(data));
      } else {
        dispatch(updateForAdminTicket(data));
      }
    });

    // socket.on("updatedticketData", (data) => {
    //   console.log("Ticket update :", data);
    //   dispatch(updateForAdminTicket(data));

    // });

    socket.on("ticketClaimed", (data) => {
      console.log("Ticket claimed successfully:", data);
      // dispatch(claimAdminTicket(data));
      const currentUserId = decoded.user_id; // Replace this with your method of getting the current user ID
      dispatch(claimAdminTicket({ ...data, currentUserId }));
    });

    socket.emit("updatedticketRoom", decoded.SubDepartmentID);
    socket.emit("joinDepaTicketRoom", decoded.SubDepartmentID);

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        setNotificationPermission(permission);
      });
    }
  }, [notificationPermission]);

  const showTicketNotification = (data) => {
    if (notificationPermission === "granted") {
      const { Description, TicketID } = data;
      const notificationTitle = `Ticket Created With Id: ${TicketID}`;
      const notificationBody = `Ticket ${Description}`;
      const notification = new Notification(notificationTitle, {
        body: notificationBody,
        icon: `${logo}`, // Add appropriate path to your icon
      });

      notification.onclick = () => {
        console.log("Notification clicked");
        const ticketDetailsURL = `https://13.235.240.117:5173/admin/home`;
        window.location.href = ticketDetailsURL;
      };
    }
  };

  function formatDateTime(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${hours}:${minutes}:${seconds} ${day}-${month}-${year}`;
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleClaimTicket = async (ticketId) => {
    try {
      // await axios.post(`https://13.235.240.117:2000/api/claim-ticket/${ticketId}`, {
      //   claim_User_Id: userInfo.user_id
      // });
      const formDataToSend = {
        TicketID: ticketId,
        user_id: userInfo.user_id,
      };
      socket.emit("claimTicket", {
        AssignedToSubDepartmentID: decoded.SubDepartmentID,
        formData: formDataToSend,
      });

      console.log(ticketId, userInfo.user_id);
    } catch (error) {
      console.error("Error claiming ticket:", error);
    }
  };
  const ticketsData =
    activeTable === "AdminTickets"
      ? AdminTickets
      : activeTable === "ResFromOtherDepTickets"
      ? ResFromOtherDepTickets
      : AdminClaimedTickets;

  useEffect(() => {
    handleTicketClick();
  }, [ticketsData]);

  // Calculate paginated tickets
  const paginatedTickets = ticketsData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const totalPages = Math.ceil(ticketsData.length / rowsPerPage);

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "text-red-600"; // Red color for empty status
      case "Resolved":
        return "text-blue-600"; // Blue color for resolved status
      case "Closed":
        return "text-green-600"; // Green color for closed status
      default:
        return "text-gray-700"; // Default color for other statuses
    }
  };

  const fetchClosedTickets = async () => {
    try {
      const response = await axios.get(
        `https://13.235.240.117:2000/api/emp-ticket/Closed/${decoded.user_id}`
      );
      setClosedTickets(response.data.tickets);
      setActiveTab("closed");
    } catch (error) {
      console.error("Error fetching closed tickets:", error);
    }
  };

  const fetchResolvedTickets = async () => {
    try {
      const response = await axios.get(
        `https://13.235.240.117:2000/api/emp-ticket/resolved/${decoded.user_id}`
      );
      setResolvedTickets(response.data.tickets);
      setActiveTab("resolved");
    } catch (error) {
      console.error("Error fetching resolved tickets:", error);
    }
  };
  const renderTable = (tickets) => (
    <div className="table-container">
      <table
        className={`custom-table ${selectedTicket ? "selected-table" : ""}`}
      >
        <thead>
          <tr>
            <th>Ticket ID</th>
            <th>Ticket Type</th>
            <th>Ticket Query</th>
            <th>Status</th>
            <th>Description</th>
            <th>Resolution Description</th>
            <th>Close Description</th>
            <th>Resolution Feedback</th>
            <th>Created At</th>
            <th>Updated At</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr
              key={ticket.TicketID}
              onClick={() => handleTicketClick(ticket)}
              className={`cursor-pointer ${
                selectedTicket === ticket ? "selected-row" : ""
              }`}
            >
              <td>{ticket.TicketID}</td>
              <td>{ticket.TicketType}</td>
              <td>{ticket.TicketQuery}</td>
              <td>
                <span className={getStatusClass(ticket.Status)}>
                  {ticket.Status}
                </span>
              </td>
              <td>{ticket.Description}</td>
              <td>{ticket.ResolutionDescription}</td>
              <td>{ticket.CloseDescription}</td>
              <td>{ticket.ResolutionFeedback}</td>
              <td>{new Date(ticket.createdAt).toLocaleString()}</td>
              <td>{new Date(ticket.updatedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // const formatDateTime = (dateTime) => {
  //   return moment(dateTime).format('YYYY-MM-DD HH:mm:ss');
  // };

  const calculateRemainingTimess = (recTime, timeInMinutes) => {
    const currentTime = moment();
    const endTime = moment(recTime).add(timeInMinutes, "minutes");
    const duration = moment.duration(endTime.diff(currentTime));
    const hours = Math.floor(duration.asHours());
    const minutes = Math.floor(duration.minutes());
    const seconds = Math.floor(duration.seconds());
    const isPast = duration.asMilliseconds() < 0;

    return {
      remainingTime: `${isPast ? "-" : ""}${Math.abs(hours)
        .toString()
        .padStart(2, "0")}:${Math.abs(minutes)
        .toString()
        .padStart(2, "0")}:${Math.abs(seconds).toString().padStart(2, "0")}`,
      isPast,
    };
  };
  useEffect(() => {
    const interval = setInterval(() => {
      const updates = paginatedTickets.map((ticket) => {
        const { remainingTime, isPast } = calculateRemainingTimess(
          ticket.createdAt,
          ticket.TicketResTimeInMinutes
        );
        return { ticketID: ticket.TicketID, remainingTime, isPast };
      });
      setTimeUpdates(updates);
    }, 1000); // Update every second

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [paginatedTickets]);
  return (
    <>
      <div className="container mx-auto p-1 flex flex-col sm:flex-row text-sm">
        <div className="sm:w-full">
          <div className="mb-4">
            <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-4">
              <div
                className={`bg-red-200 p-4 rounded shadow flex justify-around hover:bg-red-400 cursor-pointer ${
                  activeTable === "AdminTickets" ? "bg-red-400" : ""
                }`}
                onClick={() => {
                  setActiveTable("AdminTickets");
                  setCurrentPage(1); // Reset to the first page when changing tables
                }}
              >
                <div>
                  <strong>Ticket</strong>
                  <h5 className="font-semibold">{AdminTickets.length}</h5>
                </div>
              </div>

              <div
                className={`bg-green-200 p-4 rounded shadow flex justify-around hover:bg-green-400 cursor-pointer ${
                  activeTable === "ResFromOtherDepTickets" ? "bg-green-400" : ""
                }`}
                onClick={() => {
                  setActiveTable("ResFromOtherDepTickets");
                  setCurrentPage(1); // Reset to the first page when changing tables
                }}
              >
                <div>
                  <strong>Other Dep</strong>
                  <h5 className="font-semibold">
                    {ResFromOtherDepTickets.length}
                  </h5>
                </div>
              </div>

              <div
                className={`bg-blue-200 p-4 rounded shadow flex justify-around hover:bg-blue-400 cursor-pointer ${
                  activeTable === "AdminClaimedTickets" ? "bg-blue-400" : ""
                }`}
                onClick={() => {
                  setActiveTable("AdminClaimedTickets");
                  setCurrentPage(1); // Reset to the first page when changing tables
                }}
              >
                <div>
                  <strong>Claimed Tickets</strong>
                  <h5 className="font-semibold">
                    {AdminClaimedTickets.length}
                  </h5>
                </div>
              </div>
            </div>
          </div>

          {activeTable === "AdminTickets" &&
            (AdminTickets.length > 0 ? (
              <div className="table-container">
                <table
                  className={`custom-table ${
                    selectedTicket ? "selected-table" : ""
                  }`}
                >
                  <thead>
                    <tr>
                      <th>Id</th>
                      <th>T-Type</th>
                      <th>Rec-Time</th>
                      <th>Status</th>
                      <th>UniqueId</th>
                      <th>Category</th>
                      <th>Subcategory</th>
                      <th>Location</th>
                      <th>From</th>
                      <th>Depat</th>
                      <th>Time</th>
                      <th>Time Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTickets.map((ticket) => {
                      // const { remainingTime, isPast } = calculateRemainingTimess(ticket.createdAt, ticket.TicketResTimeInMinutes);

                      const timeUpdate =
                        timeUpdates.find(
                          (update) => update.ticketID === ticket.TicketID
                        ) || {};
                      const { remainingTime, isPast } =
                        calculateRemainingTimess(
                          ticket.createdAt,
                          ticket.TicketResTimeInMinutes
                        );
                      // const timeUpdate =
                      //   timeUpdates.find(
                      //     (update) => update.ticketID === ticket.TicketID
                      //   ) || {};
                      // const { remainingTime, isPast } =
                      //   calculateRemainingTimess(
                      //     ticket.createdAt,
                      //     ticket.TicketResTimeInMinutes
                      //   );
                      return (
                        <tr
                          key={ticket.TicketID}
                          onClick={() => handleTicketClick(ticket)}
                          className={`cursor-pointer ${
                            selectedTicket === ticket ? "selected-row" : ""
                          }`}
                        >
                          <td>{ticket.TicketID}</td>
                          <td>{ticket.TicketType}</td>
                          <td>{formatDateTime(ticket.createdAt)}</td>
                          <td>
                            <span className={getStatusClass(ticket.Status)}>
                              {ticket.Status}
                            </span>
                          </td>
                          <td>
                            {ticket.LeadId
                              ? ticket.LeadId
                              : ticket.from_User.user_reg_no}
                          </td>
                          <td>{ticket.Querycategory}</td>
                          <td>{ticket.QuerySubcategory}</td>
                          <td>{ticket.from_User.location}</td>
                          <td>{ticket.from_User.user_Name}</td>
                          <td>{ticket.from_User.Department.DepartmentName}</td>
                          <td>{ticket.TicketResTimeInMinutes}</td>
                          {/* <td style={{ color: isPast ? "red" : "green" }}>
                            {isPast
                              ? `${Math.abs(
                                  timeUpdate.remainingTime || remainingTime
                                )} min overdue`
                              : `${
                                  timeUpdate.remainingTime || remainingTime
                                } min remaining`}
                          </td> */}
                          <td style={{ color: isPast ? "red" : "green" }}>
                            {timeUpdate.remainingTime || remainingTime}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <h1>You Don't have This Tickets</h1>
            ))}

          {activeTable === "ResFromOtherDepTickets" &&
            (ResFromOtherDepTickets.length > 0 ? (
              <div className="table-container">
                <table
                  className={`custom-table ${
                    selectedTicket ? "selected-table" : ""
                  }`}
                >
                  <thead>
                    <tr>
                      <th>Id</th>
                      <th>T-Type</th>
                      <th>Rec-Time</th>
                      <th>Status</th>
                      <th>Location</th>
                      <th>From</th>
                      <th>Depat</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTickets.map((ticket) => (
                      <tr
                        key={ticket.TicketID}
                        onClick={() => handleTicketClick(ticket)}
                        className={`cursor-pointer ${
                          selectedTicket === ticket ? "selected-row" : ""
                        }`}
                      >
                        <td>{ticket.TicketID}</td>
                        <td>{ticket.TicketType}</td>
                        <td>{formatDateTime(ticket.createdAt)}</td>
                        <td>
                          <span className={getStatusClass(ticket.Status)}>
                            {ticket.Status}
                          </span>
                        </td>
                        <td>{ticket.from_User.location}</td>
                        <td>{ticket.from_User.user_Name}</td>
                        <td>{ticket.from_User.Department.DepartmentName}</td>
                        <td>{ticket.TicketResTimeInMinutes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <h1>You Don't have This Tickets</h1>
            ))}

          {activeTable === "AdminClaimedTickets" &&
            (AdminClaimedTickets.length > 0 ? (
              <div className="table-container">
                <table
                  className={`custom-table ${
                    selectedTicket ? "selected-table" : ""
                  }`}
                >
                  <thead>
                    <tr>
                      <th>Id</th>
                      <th>T-Type</th>
                      <th>Rec-Time</th>
                      <th>Status</th>
                      <th>UniqueId</th>
                      <th>category</th>
                      <th>Subcategory</th>
                      <th>Location</th>
                      <th>From</th>
                      <th>Depat</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTickets.map((ticket) => (
                      <tr
                        key={ticket.TicketID}
                        onClick={() => handleTicketClick(ticket)}
                        className={`cursor-pointer ${
                          selectedTicket === ticket ? "selected-row" : ""
                        }`}
                      >
                        <td>{ticket.TicketID}</td>
                        <td>{ticket.TicketType}</td>
                        <td>{formatDateTime(ticket.createdAt)}</td>
                        <td>
                          <span className={getStatusClass(ticket.Status)}>
                            {ticket.Status}
                          </span>
                        </td>
                        <td>
                          {ticket.LeadId
                            ? ticket.LeadId
                            : ticket.from_User.user_reg_no}
                        </td>
                        <td>{ticket.Querycategory}</td>
                        <td>{ticket.QuerySubcategory}</td>
                        <td>{ticket.from_User.location}</td>
                        <td>{ticket.from_User.user_Name}</td>
                        <td>{ticket.from_User.Department.DepartmentName}</td>
                        <td>{ticket.TicketResTimeInMinutes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <h1>You Don't have This Tickets</h1>
            ))}

          {paginatedTickets.length > 0 && (
            <>
              <div className="flex justify-center items-center mt-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-blue-500 text-black-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="mx-4">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-blue-500 text-black-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </>
          )}
          <div>
            <h6 className="font-semibold mb-2">Tickets raised by me</h6>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                onClick={fetchClosedTickets}
                className="bg-teal-200 p-4 rounded shadow cursor-pointer"
              >
                Closed {closedTickets.length}
              </div>
              <div
                onClick={fetchResolvedTickets}
                className="bg-gray-200 p-4 rounded shadow cursor-pointer"
              >
                Resolved {resolvedTickets.length}
              </div>
              <div className="bg-cyan-200 p-4 rounded shadow">Card 3</div>
              <div className="bg-lime-200 p-4 rounded shadow">Card 4</div>
            </div>
          </div>

          {activeTab === "closed" && renderTable(closedTickets)}
          {activeTab === "resolved" && renderTable(resolvedTickets)}
        </div>

        {/* Right Column */}
        {selectedTicket ? (
          <>
            <div className="sm:w-full">
              <div className="bg-white rounded-lg shadow-md p-1 ms-2 overflow-y-auto w-full">
                <div className="flex bg-white justify-between border-2 p-1">
                  {selectedTicket.claim_User_Id ? (
                    <>
                      <button className="bg-green-500 hover:bg-grrn-700 text-white font-bold py-1 px-4 rounded focus:outline-none focus:shadow-outline">
                        Claimed
                      </button>
                    </>
                  ) : (
                    <>
                      {" "}
                      <div className="ms-1 text-blue-600">
                        <button
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-4 rounded focus:outline-none focus:shadow-outline"
                          onClick={() =>
                            handleClaimTicket(selectedTicket.TicketID)
                          }
                        >
                          Claim
                        </button>{" "}
                      </div>
                    </>
                  )}

                  <div className="text-blue-600">
                    Ticket Id: {selectedTicket.TicketID}
                  </div>
                  <button onClick={() => handleTicketClick()} type="button">
                    ✖
                  </button>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between">
                    <p className="text-gray-700 mb-2">
                      <b>Status:</b>{" "}
                      <span className={getStatusClass(selectedTicket.Status)}>
                        {selectedTicket.Status}
                      </span>
                    </p>
                    <p className="text-gray-700 mb-2">
                      <b>Reg No:</b>{" "}
                      <span>{selectedTicket.from_User.user_reg_no}</span>
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <p className="text-gray-700 mb-2">
                      <b>Time limit:</b> {selectedTicket.TicketResTimeInMinutes}{" "}
                      minutes
                    </p>
                    <p className="text-gray-700 mb-2">
                      <b>Recived Time:</b>{" "}
                      <span>{formatDateTime(selectedTicket.createdAt)}</span>
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <p className="text-gray-700 mb-2">
                      <b>Email:</b>{" "}
                      <span>{selectedTicket.from_User.user_Email}</span>
                    </p>
                    <p className="text-gray-700 mb-2">
                      <b>Mobile:</b>{" "}
                      <span>{selectedTicket.from_User.user_Mobile}</span>
                    </p>
                  </div>

                  <p className="text-gray-700 mb-4 border border-indigo-600 p-4 rounded-md">
                    <div className="flex justify-between">
                      <span>
                        <b>From:</b> {selectedTicket.from_User.user_Name}
                      </span>
                      <span>
                        <b>Department:</b>{" "}
                        {selectedTicket.from_User.Department.DepartmentName}
                      </span>
                      <span>
                        <b>LeadId:</b> {selectedTicket.LeadId}
                      </span>
                    </div>
                    <br />
                    <div className="border-2 py-5 px-1">
                      {selectedTicket.Description}
                    </div>
                    <br />
                    <b>Time & Date:</b>{" "}
                    {formatDateTime(selectedTicket.createdAt)}
                    {!selectedTicket.ResolutionDescription ? (
                      <>
                        <div className="border-t-4 border-sky-500 mt-2 pt-2">
                          <Resolution TicketData={selectedTicket} />
                        </div>
                      </>
                    ) : (
                      <></>
                    )}
                  </p>

                  {selectedTicket.claim_User &&
                    selectedTicket.ResolutionDescription && (
                      <div className="text-gray-700 mb-4 border border-indigo-600 p-4 rounded-md">
                        <div className="flex justify-between">
                          <span>
                            <b>Ticket From:</b>{" "}
                            {selectedTicket.claim_User.user_Name}
                          </span>
                          <span>
                            <b>Department:</b>{" "}
                            {
                              selectedTicket.claim_User.Department
                                .DepartmentName
                            }
                          </span>
                        </div>
                        <br />
                        <div className="border-2 py-5 px-1">
                          {selectedTicket.ResolutionDescription}
                        </div>
                        <br />
                        <b>Time & Date:</b>{" "}
                        {formatDateTime(selectedTicket.Resolution_Timestamp)}
                      </div>
                    )}

                  {selectedTicket.TransferredToDepartment && (
                    <div className="text-gray-700 mb-4 border border-indigo-600 p-4 rounded-md">
                      {selectedTicket.TransferDescription ? (
                        <>
                          <div className="flex justify-between">
                            <span>
                              <b>Transfer To :</b>{" "}
                              {
                                selectedTicket.transferredClaimUser.Department
                                  .DepartmentName
                              }
                            </span>
                            <span>
                              <b>Admin:</b>{" "}
                              {selectedTicket.transferredClaimUser.user_Name}
                            </span>

                            <span>
                              <b>From:</b>{" "}
                              {
                                selectedTicket.transferredClaimUser.Department
                                  .DepartmentName
                              }
                            </span>
                          </div>
                          <br />
                          <div className="border-2 py-5 px-1">
                            {selectedTicket.TransferDescription}
                          </div>
                          <br />
                          <b>Time & Date:</b>{" "}
                          {formatDateTime(selectedTicket.Resolution_Timestamp)}
                        </>
                      ) : (
                        <>
                          {" "}
                          <Transferred TicketData={selectedTicket} />{" "}
                        </>
                      )}
                    </div>
                  )}

                  {selectedTicket.CloseDescription &&
                    selectedTicket.Status === "Closed" && (
                      <div className="text-gray-700 mb-4 border border-indigo-600 p-4 rounded-md">
                        <div className="flex justify-between">
                          <span>
                            <b>Closed with:</b>{" "}
                            {selectedTicket.from_User.user_Name}
                          </span>
                          <span>
                            <b>Department:</b>{" "}
                            {selectedTicket.from_User.Department.DepartmentName}
                          </span>
                        </div>
                        <br />

                        <div className="border-2 py-5 px-1">
                          {selectedTicket.CloseDescription}
                        </div>
                        <br />
                        <div className="flex justify-between">
                          <span>
                            <b>Time & Date:</b>{" "}
                            {formatDateTime(selectedTicket.closed_Timestamp)}
                          </span>
                          <span>
                            <b>Rating:</b> {selectedTicket.ResolutionFeedback}
                          </span>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <></>
        )}
      </div>
    </>
  );
}

export default DepartmentsTickets;
