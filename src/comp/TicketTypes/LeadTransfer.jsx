import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserCreatedTicket,
  createTicket,
  updateStudentTicketsArray,
} from "../../reduxToolkit/features/TicketSlice";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { io } from "socket.io-client";
import Close from "../Tables/Reply/Close";

const currentTime = new Date();
const currentDay = new Date();
function LeadTransfer() {
  const socket = useMemo(() => io("https://13.235.240.117:2000"), []);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [LeadForm, setLeadForm] = useState(false);

  const [closedTickets, setClosedTickets] = useState([]);
  const [resolvedTickets, setResolvedTickets] = useState([]);
  const [activeTab, setActiveTab] = useState(null);

  const [attchedfiles, setAttchedfiles] = useState(null);
  const [description, setDescription] = useState("");
  const [leadId, setLeadId] = useState("");
  const [queryCategories, setQueryCategories] = useState([]);
  const [querySubcategories, setQuerySubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [ticketResTimeInMinutes, setTicketResTimeInMinutes] = useState(0);

  const [allDepartments, setAllDepartments] = useState([]);
  const [filteredSubDepartments, setFilteredSubDepartments] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);

  const [selectedGenDepartment, setSelectedGenDepartment] = useState("");
  const [selectedGenSubDepartment, setSelectedGenSubDepartment] = useState("");
  const [selectedGenCategory, setSelectedGenCategory] = useState("");
  const [selectedGenSubcategory, setSelectedGenSubcategory] = useState("");
  const [timeInMinutes, setTimeInMinutes] = useState("");

  console.log(
    selectedGenDepartment,
    selectedGenSubDepartment,
    selectedGenCategory,
    selectedGenSubcategory,
    timeInMinutes,
    41
  );

  useEffect(() => {
    // Fetch all query categories and subcategories in one request
    const fetchQueryData = async () => {
      try {
        const response = await axios.get(
          "https://13.235.240.117:2000/api/mis-hierarchy"
        );
        setQueryCategories(response.data);
      } catch (error) {
        console.error("Error fetching query data:", error);
      }
    };

    fetchQueryData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://13.235.240.117:2000/api/all-hierarchy"
        ); // Adjust API endpoint as needed
        setAllDepartments(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const token = localStorage.getItem("token");

  const decoded = jwtDecode(token);
  console.log(decoded, 19);

  const { userInfo } = useSelector((state) => state.user);
  const { UserTickets, loading } = useSelector((state) => state.UserTickets);

  const [formData, setFormData] = useState({});

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
            "https://13.235.240.117:2000/api/img-save",
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

      if (selectedGenDepartment) {
        // socket.emit("joinDepaTicketRoom", selectedGenSubDepartment);
        const roomId = Number(selectedGenSubDepartment);
        socket.emit("joinDepaTicketRoom", roomId);

        const formDataToSend = {
          Description: description,
          AssignedToDepartmentID: selectedGenDepartment,
          AssignedToSubDepartmentID: selectedGenSubDepartment,
          // LeadId: leadId,
          Querycategory: selectedGenCategory,
          QuerySubcategory: selectedGenSubcategory,
          TicketResTimeInMinutes: timeInMinutes,
          TicketType: ticketType,
          Status: "Pending",
          AttachmentUrl: updatedAttachmentUrls,
          user_id: userInfo.user_id,
        };

        socket.emit("createTicket", {
          AssignedToSubDepartmentID: roomId,
          formData: formDataToSend,
        });
        console.log(formDataToSend, 149);

        // dispatch(createTicket(formDataToSend));
      } else {
        const formDataToSend = {
          Description: description,
          AssignedToDepartmentID: 1,
          AssignedToSubDepartmentID: 4,
          LeadId: leadId,
          Querycategory: selectedCategory,
          QuerySubcategory: selectedSubcategory,
          TicketResTimeInMinutes: ticketResTimeInMinutes,
          TicketType: ticketType,
          Status: "Pending",
          AttachmentUrl: updatedAttachmentUrls,
          user_id: userInfo.user_id,
        };

        socket.emit("createTicket", {
          AssignedToSubDepartmentID: 4,
          formData: formDataToSend,
        });
        console.log(formDataToSend, 170);
        // dispatch(createTicket(formDataToSend));
      }
      setLeadForm(false);
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
    socket.on("updatedDeptTicketChat", (data) => {
      console.log("Ticket created successfully:", data);
      dispatch(updateStudentTicketsArray(data));
    });

    socket.emit("joinDepaTicketRoom", 4);

    // socket.emit("updatedticketRoom", selectedGenSubDepartment);

    socket.on("ticketCreationError", (error) => {
      console.error("Ticket creation error:", error.message);
    });

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

  const handleTicketClick = async (ticket) => {
    setSelectedTicket(ticket);
  };
  const formGenralShow = () => {
    setShowForm(!showForm);
    setLeadForm(false);
  };

  const formLeadShow = () => {
    setLeadForm(!LeadForm);
    setShowForm(false);
  };

  const handleCategoryChangeLead = (event) => {
    const categoryName = event.target.value;
    setSelectedCategory(categoryName);

    // Filter subcategories based on selected category
    const subcategories =
      queryCategories.find(
        (category) => category.QueryCategoryName === categoryName
      )?.QuerySubcategories || [];
    setQuerySubcategories(subcategories);
    setSelectedSubcategory(""); // Reset subcategory selection
    setTicketResTimeInMinutes(0); // Reset time in minutes
  };

  const handleSubcategoryChangeLead = (event) => {
    const subcategoryName = event.target.value;
    const subcategory = querySubcategories.find(
      (sub) => sub.QuerySubcategoryName === subcategoryName
    );
    setSelectedSubcategory(subcategoryName);
    setTicketResTimeInMinutes(subcategory?.TimeInMinutes || 0);
  };

  const handleDepartmentChange = (event) => {
    const selectedDepartmentId = event.target.value;
    setSelectedGenDepartment(selectedDepartmentId);
    setSelectedGenSubDepartment("");
    setSelectedGenCategory("");
    setSelectedGenSubcategory("");
    setTimeInMinutes("");

    const selectedDepartment = allDepartments.find(
      (dept) => dept.DepartmentID === parseInt(selectedDepartmentId)
    );
    setFilteredSubDepartments(selectedDepartment?.SubDepartments || []);
    setFilteredCategories(selectedDepartment?.QueryCategories || []);
  };

  const handleSubDepartmentChange = (event) => {
    const selectedSubDepartmentId = event.target.value;
    setSelectedGenSubDepartment(selectedSubDepartmentId);
    setSelectedGenCategory("");
    setSelectedGenSubcategory("");
    setTimeInMinutes("");

    const selectedSubDepartment = filteredSubDepartments.find(
      (subDept) => subDept.SubDepartmentID === parseInt(selectedSubDepartmentId)
    );
    setFilteredCategories(selectedSubDepartment?.QueryCategories || []);
  };

  const handleCategoryChange = (event) => {
    const selectedCategoryName = event.target.value;
    setSelectedGenCategory(selectedCategoryName);
    setSelectedGenSubcategory("");
    setTimeInMinutes("");

    const selectedCategory = filteredCategories.find(
      (cat) => cat.QueryCategoryName === selectedCategoryName
    );
    setFilteredSubCategories(selectedCategory?.QuerySubcategories || []);
  };

  const handleSubCategoryChange = (event) => {
    const selectedSubCategoryName = event.target.value;
    setSelectedGenSubcategory(selectedSubCategoryName);

    const selectedSubCategory = filteredSubCategories.find(
      (subCat) => subCat.QuerySubcategoryName === selectedSubCategoryName
    );
    setTimeInMinutes(selectedSubCategory?.TimeInMinutes || "");
  };

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
        `https://13.235.240.117:2000/api/Closed/tickets/${decoded.user_id}`
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
        `https://13.235.240.117:2000/api/resolved/tickets/${decoded.user_id}`
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
            {decoded.DepartmentID === 4 ? (
              <>
                <button
                  onClick={formLeadShow}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
                >
                  {LeadForm ? "Hide Form" : "Lead Transfer"}
                </button>

                <button
                  onClick={formGenralShow}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
                >
                  {showForm ? "Hide Form" : "Generate Ticket"}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={formGenralShow}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
                >
                  {showForm ? "Hide Form" : "Generate Ticket"}
                </button>
              </>
            )}
          </div>

          {LeadForm && (
            <div className="max-w-2xl mx-auto p-2 bg-white rounded shadow-md">
              {/* <h6 className="text-xl text-blue-600 mb-2">Generate Ticket</h6> */}
              <form onSubmit={handleSubmit}>
                <div className="flex justify-between space-x-4">
                  <div className="flex-1">
                    {/* <label className="block text-gray-700">
                      Query Category:
                    </label> */}
                    <select
                      value={selectedCategory}
                      onChange={handleCategoryChangeLead}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    >
                      <option value="">Select Category</option>
                      {queryCategories.map((category) => (
                        <option
                          key={category.QueryCategoryID}
                          value={category.QueryCategoryName}
                        >
                          {category.QueryCategoryName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedCategory && (
                    <div className="flex-1">
                      {/* <label className="block text-gray-700">
                        Query Subcategory:
                      </label> */}
                      <select
                        value={selectedSubcategory}
                        onChange={handleSubcategoryChangeLead}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      >
                        <option value="">Select Subcategory</option>
                        {querySubcategories.map((subcategory) => (
                          <option
                            key={subcategory.QuerySubCategoryID}
                            value={subcategory.QuerySubcategoryName}
                          >
                            {subcategory.QuerySubcategoryName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="mb-2">
                  <input
                    id="leadId"
                    name="leadId"
                    value={leadId}
                    onChange={(e) => setLeadId(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="Lead Id"
                  />
                </div>

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

          {showForm && (
            <>
              <div className="max-w-2xl mx-auto p-2 bg-white rounded shadow-md">
                {/* <h6 className="text-xl text-blue-600 mb-2">Generate Ticket</h6> */}

                <form onSubmit={handleSubmit}>
                  <div className="flex justify-between space-x-4">
                    <div className="flex-1">
                      <label className="block text-gray-700">Department:</label>
                      <select
                        value={selectedGenDepartment}
                        onChange={handleDepartmentChange}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      >
                        <option value="">Select Department</option>
                        {allDepartments.map((department) => (
                          <option
                            key={department.DepartmentID}
                            value={department.DepartmentID}
                          >
                            {department.DepartmentName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedGenDepartment && (
                      <div className="flex-1">
                        <label className="block text-gray-700">
                          Sub Department:
                        </label>
                        <select
                          value={selectedGenSubDepartment}
                          onChange={handleSubDepartmentChange}
                          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        >
                          <option value="">Select Sub Department</option>
                          {filteredSubDepartments.map((subDepartment) => (
                            <option
                              key={subDepartment.SubDepartmentID}
                              value={subDepartment.SubDepartmentID}
                            >
                              {subDepartment.SubDepartmentName}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {selectedGenSubDepartment && (
                    <div className="flex justify-between space-x-4">
                      <div className="flex-1">
                        <label className="block text-gray-700">
                          Query Category:
                        </label>
                        <select
                          value={selectedGenCategory}
                          onChange={handleCategoryChange}
                          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        >
                          <option value="">Select Query Category</option>
                          {filteredCategories.map((category) => (
                            <option
                              key={category.QueryCategoryID}
                              value={category.QueryCategoryName}
                            >
                              {category.QueryCategoryName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {selectedGenCategory && (
                        <div className="flex-1">
                          <label className="block text-gray-700">
                            Query Subcategory:
                          </label>
                          <select
                            value={selectedGenSubcategory}
                            onChange={handleSubCategoryChange}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                          >
                            <option value="">Select Query Subcategory</option>
                            {filteredSubCategories.map((subCategory) => (
                              <option
                                key={subCategory.QuerySubCategoryID}
                                value={subCategory.QuerySubcategoryName}
                              >
                                {subCategory.QuerySubcategoryName}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedGenSubcategory && (
                    <div>
                      <label className="block text-gray-700">
                        Resolution Time in Minutes:
                      </label>
                      <input
                        type="text"
                        value={timeInMinutes}
                        readOnly
                        className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none sm:text-sm"
                      />
                    </div>
                  )}

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
            </>
          )}
        </div>

        {/* {selectedSubcategory && (
          <div>
            <label className="block text-gray-700">Resolution Time in Minutes:</label>
            <input
              type="text"
              value={ticketResTimeInMinutes}
              readOnly
              className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none sm:text-sm"
            />
          </div>
        )} */}

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
                    <th>UniqueId</th>
                    <th>category</th>
                    <th>Subcategory</th>
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
                      <td>
                        {ticket.LeadId ? (
                          <> {ticket.LeadId} </>
                        ) : (
                          <>{ticket.from_User.user_reg_no}</>
                        )}
                      </td>
                      <td>{ticket.Querycategory}</td>
                      <td>{ticket.QuerySubcategory}</td>
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
          <> </>
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

          {activeTab === "closed" && renderTable(closedTickets)}
          {activeTab === "resolved" && renderTable(resolvedTickets)}
        </div>
      </div>

      {/* Right Column */}
      {selectedTicket ? (
        <>
          <div className="sm:w-full">
            <div className="bg-white rounded-lg shadow-md p-2 overflow-y-auto w-full">
              <div className="flex bg-white justify-between border p-1">
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

export default LeadTransfer;
