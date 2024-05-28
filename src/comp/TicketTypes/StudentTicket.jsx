import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserCreatedTicket,
  updateForStudentTicket,
  updateStudentTicketsArray,
  // createTicket,
} from "../../reduxToolkit/features/TicketSlice";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { io } from "socket.io-client";
import Close from "../Tables/Reply/Close";

const currentTime = new Date();
const currentDay = new Date();
function StudentTicket() {
  const socket = useMemo(() => io("http://65.1.54.123:2000"), []);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [closedTickets, setClosedTickets] = useState([]);
  const [resolvedTickets, setResolvedTickets] = useState([]);
  const [activeTab, setActiveTab] = useState(null);

  const [attchedfiles, setAttchedfiles] = useState(null);
  const [description, setDescription] = useState("");
  const token = localStorage.getItem("token");

  const decoded = jwtDecode(token);
  console.log(decoded, 19);

  const { userInfo } = useSelector((state) => state.user);
  const { UserTickets, loading } = useSelector((state) => state.UserTickets);

  const [formData, setFormData] = useState({
    TicketType: getTicketType(currentTime, currentDay),
    Status: "Pending",
    Description: "",
    TicketResTimeInMinutes: 60,
    AssignedToDepartmentID: 2,
    AssignedToSubDepartmentID: 5,
    // files: null, // Change to null for initial state
    user_id: decoded.user_id,
  });

  const dispatch = useDispatch();

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      AttachmentUrl: e.target.files,
    });
    setAttchedfiles(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const currentTime = new Date();
      const currentDay = new Date();

      const ticketType = getTicketType(currentTime, currentDay);

      let updatedAttachmentUrls = [];
      if (attchedfiles && attchedfiles.length > 0) {
        for (const file of attchedfiles) {
          const formData = new FormData();
          formData.append("files", file);

          const response = await axios.post(
            "http://65.1.54.123:2000/api/img-save",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          console.log(response, 2332);
          updatedAttachmentUrls.push(response.data.data);
        }
      }

      // Create form data to be sent to the server
      const formDataToSend = {
        Description: description,
        AssignedToDepartmentID: 2,
        AssignedToSubDepartmentID: 5,
        TicketResTimeInMinutes: 60,
        TicketType: ticketType,
        Status: "Pending",
        AttachmentUrl: updatedAttachmentUrls,
        user_id: userInfo.user_id,
      };

      socket.emit("createTicket", {
        AssignedToSubDepartmentID: 5,
        formData: formDataToSend,
      });

      // dispatch(createTicket(formDataToSend));

      setShowForm(false);
    } catch (error) {
      console.error("Error creating ticket:", error);
    }
  };

  useEffect(() => {
    if (userInfo) {
      const user_id = userInfo.user_id;
      dispatch(getUserCreatedTicket({ user_id: user_id }));
    }
  }, [userInfo]);

  useEffect(() => {
    // socket.on('updatedDeptTicketChat', (data) => {
    //   console.log('New ticket data:', data);
    //   // Handle the updated ticket data as needed
    // });

    socket.on("updatedDeptTicketChat", (data) => {
      console.log("Ticket created successfully:", data);
      dispatch(updateStudentTicketsArray(data));
    });

    socket.emit("joinDepaTicketRoom", 5);

    // socket.on('ticketCreated', (data) => {
    //   console.log('Ticket created successfully:', data);
    //   dispatch(updateStudentTicketsArray(data));
    // });

    // socket.on('updatedticketDataForStudent', (data) => {
    //   console.log('Ticket update :', data);
    //   dispatch(updateForStudentTicket(data))
    // });

    //   socket.emit("updatedticketRoom", decoded.SubDepartmentID);

    // socket.on('ticketCreationError', (error) => {
    //   console.error('Ticket creation error:', error.message);
    //   // Handle the ticket creation error as needed
    // });

    return () => {
      socket.disconnect();
    };
  }, [socket]);

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

  function getTicketType(currentTime, currentDay) {
    const currentTimeIST = new Date(
      currentTime.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    const hours = currentTimeIST.getHours();
    const day = currentDay.getDay(); // Sunday is 0, Monday is 1, ..., Saturday is 6

    if (hours >= 10 && hours < 17 && day >= 1 && day <= 5) {
      return "normal"; // Ticket created between 10 am to 5 pm on weekdays
    } else {
      return "OverNight"; // Ticket created after 5 pm or before 10 am, or on weekends
    }
  }

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

  const handleTicketClick = async (ticket) => {
    setSelectedTicket(ticket);
  };
  const formGenralShow = () => {
    setShowForm(!showForm);
  };

  const fetchClosedTickets = async () => {
    try {
      const response = await axios.get(
        `http://65.1.54.123:2000/api/Closed/tickets/${decoded.user_id}`
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
        `http://65.1.54.123:2000/api/resolved/tickets/${decoded.user_id}`
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

  return (
    <div className="container mx-auto p-1 flex flex-col sm:flex-row text-sm">
      <div className="sm:w-full">
        <div className="container mx-auto mt-2">
          <div className="flex justify-between">
            <button
              onClick={formGenralShow}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
            >
              {showForm ? "Hide Form" : "Generate Ticket"}
            </button>
          </div>

          {showForm && (
            <div className="max-w-2xl mx-auto p-2 bg-white rounded shadow-md">
              <h6 className="text-xl text-blue-600 mb-2">Generate Ticket</h6>
              <div className="flex justify-between">
                <div className="mb-4">
                  <input
                    id="leadId"
                    name="LeadId"
                    defaultValue={userInfo.user_reg_no}
                    type="text"
                    className="mt-1 p-1 w-full border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                    placeholder="Enter Lead ID"
                  />
                </div>
                <div className="mb-4">
                  <input
                    id="leadId"
                    name="LeadId"
                    defaultValue={userInfo.user_Name}
                    type="text"
                    className="mt-1 p-1 w-full border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                    placeholder="Enter Lead ID"
                  />
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-2">
                  <textarea
                    id="description"
                    name="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="mt-1 p-5 w-full border-dashed border-4 border-indigo-300 rounded-md focus:outline-none focus:ring focus:border-blue-600"
                    placeholder="Enter a brief description"
                    required
                  />
                </div>
                <div className="mb-2">
                  <input
                    type="file"
                    id="files"
                    name="files"
                    onChange={handleFileChange}
                    className="mt-1 p-1 w-full border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                    accept=".jpg, .jpeg, .png, .gif, .pdf"
                    multiple
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Accepted file types: .jpg, .jpeg, .png, .gif, .pdf
                  </p>
                </div>

                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Create Ticket
                </button>
              </form>
            </div>
          )}
        </div>
        {UserTickets.length > 0 ? (
          <>
            <div className="table-container">
              <table
                className={`custom-table ${
                  selectedTicket ? "selected-table" : ""
                }`}
              >
                <thead>
                  <tr>
                    <th>Id</th>
                    <th>Status</th>
                    <th>Date & Time</th>
                    <th>Location</th>
                    <th>From</th>
                    <th>To Depat</th>
                    <th>Time To solve</th>
                  </tr>
                </thead>

                <tbody>
                  {UserTickets.map((ticket) => (
                    <tr
                      key={ticket.TicketID}
                      onClick={() => handleTicketClick(ticket)}
                      className={`cursor-pointer ${
                        selectedTicket === ticket ? "selected-row" : ""
                      }`}
                    >
                      <td>{ticket.TicketID}</td>
                      <td>
                        <span className={getStatusClass(ticket.Status)}>
                          {ticket.Status}
                        </span>
                      </td>
                      <td>{formatDateTime(ticket.createdAt)}</td>
                      <td>{ticket.from_User.location}</td>
                      <td>{ticket.from_User.user_Name}</td>
                      <td>{ticket.AssignedToDepartment.DepartmentName}</td>
                      <td>{ticket.TicketResTimeInMinutes} m</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <></>
        )}

        <div>
          <h6 className="font-semibold mb-2">Tickets raised by me</h6>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={fetchClosedTickets}
              className="bg-teal-200 p-4 rounded shadow cursor-pointer"
            >
              Closed
            </div>
            <div
              onClick={fetchResolvedTickets}
              className="bg-gray-200 p-4 rounded shadow cursor-pointer"
            >
              Resolved
            </div>
            <div className="bg-cyan-200 p-4 rounded shadow">Card 3</div>
            <div className="bg-lime-200 p-4 rounded shadow">Card 4</div>
          </div>

          {activeTab === "closed" && renderTable(closedTickets)}
          {activeTab === "resolved" && renderTable(resolvedTickets)}
        </div>
      </div>

      {/* Right Column */}
      {selectedTicket ? (
        <>
          <div className="sm:w-full">
            <div className="bg-white rounded-lg shadow-md p-2 overflow-y-auto w-full">
              <div className="flex bg-white justify-between border-2 p-1">
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
                    <b>Recived Time:</b>{" "}
                    <span>{formatDateTime(selectedTicket.createdAt)}</span>
                  </p>
                </div>

                <div className="flex justify-between">
                  <p className="text-gray-700 mb-2">
                    <b>Recived Time:</b>{" "}
                    <span>{formatDateTime(selectedTicket.createdAt)}</span>
                  </p>
                  <p className="text-gray-700 mb-2">
                    <b>Reg No:</b>{" "}
                    <span>{selectedTicket.from_User.user_reg_no}</span>
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
                      <b>Ticket From:</b> {selectedTicket.from_User.user_Name}
                    </span>
                    <span>
                      <b>Department:</b>{" "}
                      {selectedTicket.from_User.Department.DepartmentName}
                    </span>
                  </div>
                  <br />
                  <div className="border-2 py-5 px-1">
                    {selectedTicket.Description}
                  </div>
                  <br />
                  <b>Time & Date:</b> {formatDateTime(selectedTicket.createdAt)}
                </p>

                {selectedTicket.claim_User &&
                  selectedTicket.ResolutionDescription && (
                    <div className="text-gray-700 mb-4 border border-indigo-600 p-4 rounded-md">
                      <div className="flex justify-between">
                        <span>
                          <b>Admin:</b> {selectedTicket.claim_User.user_Name}
                        </span>
                        <span>
                          <b>From:</b>
                          {selectedTicket.claim_User.Department.DepartmentName}
                        </span>
                      </div>
                      <div className="border-2 py-5 px-1">
                        {selectedTicket.ResolutionDescription}
                      </div>
                      <br />
                      <b>Time & Date:</b>{" "}
                      {formatDateTime(selectedTicket.Resolution_Timestamp)}
                    </div>
                  )}

                {selectedTicket.transferredClaimUser && (
                  <div className="text-gray-700 mb-4 border border-indigo-600 p-4 rounded-md">
                    <div className="flex justify-between">
                      <span>
                        <b>Transfer To Department:</b>{" "}
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
                    <div className="border-2 py-5 px-1">
                      {selectedTicket.TransferDescription}
                    </div>
                    <div></div>
                    <br />
                    <b>Time & Date:</b>{" "}
                    {formatDateTime(selectedTicket.Resolution_Timestamp)}
                  </div>
                )}

                {selectedTicket.Status === "Resolved" ? (
                  <Close TicketData={selectedTicket} />
                ) : selectedTicket.Status === "Closed" ? (
                  <div className="text-gray-700 mb-4 border border-indigo-600 p-4 rounded-md">
                    <div className="flex justify-between">
                      <span>
                        <b>Closed with:</b> {selectedTicket.from_User.user_Name}
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
                ) : null}
              </div>
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
}

export default StudentTicket;
