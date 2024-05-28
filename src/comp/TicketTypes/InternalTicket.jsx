import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserCreatedTicket,
  createTicket,
} from "../../reduxToolkit/features/TicketSlice";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { io } from "socket.io-client";
import Close from "../Tables/Reply/Close";

const currentTime = new Date();
const currentDay = new Date();
function InternalTicket() {
  const socket = useMemo(() => io("http://65.1.54.123:2000"), []);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [attchedfiles, setAttchedfiles] = useState(null);
  const [description, setDescription] = useState("");

  const [departments, setDepartments] = useState([]);
  const [subDepartments, setSubDepartments] = useState([]);
  const [queryCategories, setQueryCategories] = useState([]);
  const [querySubcategories, setQuerySubcategories] = useState([]);

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedSubDepartment, setSelectedSubDepartment] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");

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

  useEffect(() => {
    // Fetch all departments initially
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(
          "http://65.1.54.123:2000/api/all-hierarchy"
        );
        setDepartments(response.data);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    fetchDepartments();
  }, []);

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
        AssignedToDepartmentID: selectedDepartment,
        AssignedToSubDepartmentID: selectedSubDepartment,
        Querycategory: selectedCategory,
        QuerySubcategory: selectedSubcategory,
        TicketResTimeInMinutes: 60,
        TicketType: ticketType,
        Status: "Pending",
        AttachmentUrl: updatedAttachmentUrls,
        user_id: userInfo.user_id,
      };

      socket.emit("createTicket", {
        // createTicket: formDataToSend,
        AssigSubDepId: 5,
      });

      dispatch(createTicket(formDataToSend));

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

  console.log(UserTickets, 38);

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
  };

  const handleDepartmentChange = async (event) => {
    const departmentName = event.target.value;
    setSelectedDepartment(departmentName);
    setSelectedSubDepartment("");
    setSelectedCategory("");
    setSelectedSubcategory("");
    setQueryCategories([]);
    setQuerySubcategories([]);

    // Fetch sub-departments for selected department
    try {
      const response = await axios.get(
        `/api/departments/${departmentName}/subdepartments`
      );
      setSubDepartments(response.data);
    } catch (error) {
      console.error("Error fetching sub-departments:", error);
    }
  };

  const handleSubDepartmentChange = async (event) => {
    const subDepartmentName = event.target.value;
    setSelectedSubDepartment(subDepartmentName);
    setSelectedCategory("");
    setSelectedSubcategory("");
    setQuerySubcategories([]);

    // Fetch query categories for selected sub-department
    try {
      const response = await axios.get(
        `/api/subdepartments/${subDepartmentName}/querycategories`
      );
      setQueryCategories(response.data);
    } catch (error) {
      console.error("Error fetching query categories:", error);
    }
  };

  const handleCategoryChange = async (event) => {
    const categoryName = event.target.value;
    setSelectedCategory(categoryName);
    setSelectedSubcategory("");

    // Fetch subcategories for selected category
    try {
      const response = await axios.get(
        `/api/querycategories/${categoryName}/querysubcategories`
      );
      setQuerySubcategories(response.data);
    } catch (error) {
      console.error("Error fetching query subcategories:", error);
    }
  };

  const handleSubcategoryChange = (event) => {
    setSelectedSubcategory(event.target.value);
  };

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

              <form onSubmit={handleSubmit}>
                <div className="flex justify-between space-x-4">
                  <div className="flex-1">
                    <label className="block text-gray-700">Department:</label>
                    <select
                      value={selectedDepartment}
                      onChange={handleDepartmentChange}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    >
                      <option value="">Select Department</option>
                      {departments.map((department) => (
                        <option
                          key={department.DepartmentID}
                          value={department.DepartmentName}
                        >
                          {department.DepartmentName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedDepartment && (
                    <div className="flex-1">
                      <label className="block text-gray-700">
                        Sub-Department:
                      </label>
                      <select
                        value={selectedSubDepartment}
                        onChange={handleSubDepartmentChange}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      >
                        <option value="">Select Sub-Department</option>
                        {subDepartments.map((subDepartment) => (
                          <option
                            key={subDepartment.SubDepartmentID}
                            value={subDepartment.SubDepartmentName}
                          >
                            {subDepartment.SubDepartmentName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {selectedSubDepartment && (
                  <div className="flex justify-between space-x-4">
                    <div className="flex-1">
                      <label className="block text-gray-700">
                        Query Category:
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      >
                        <option value="">Select Query Category</option>
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
                        <label className="block text-gray-700">
                          Query Subcategory:
                        </label>
                        <select
                          value={selectedSubcategory}
                          onChange={handleSubcategoryChange}
                          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        >
                          <option value="">Select Query Subcategory</option>
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
          )}
        </div>

        <div className="table-container">
          <table
            className={`custom-table ${selectedTicket ? "selected-table" : ""}`}
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
                  <td className="text-red-600">{ticket.Status}</td>
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
      </div>

      {/* Right Column */}
      {selectedTicket ? (
        <>
          <div className="sm:w-full">
            <div className="bg-white rounded-lg shadow-md p-6 overflow-y-auto w-full">
              <p className="text-lg font-semibold mb-4 text-blue-600 border-b pb-2">
                Ticket Details
              </p>
              <div className="mb-4">
                <div className="flex justify-between">
                  <p className="text-gray-700 mb-2">
                    <b>Status:</b> <span>{selectedTicket.Status}</span>
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

                {selectedTicket.claim_User && (
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

export default InternalTicket;
