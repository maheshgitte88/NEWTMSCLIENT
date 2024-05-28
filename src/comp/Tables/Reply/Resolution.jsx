import React, { useEffect, useMemo, useRef, useState } from "react";

import { jwtDecode } from "jwt-decode";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import {
  updateForAdminTicket,
  updatesTickets,
} from "../../../reduxToolkit/features/AdminSlice";
import { DepSubHierachy } from "../../../reduxToolkit/features/QueryDataSlices";
function Resolution({ TicketData }) {
  const socket = useMemo(() => io("http://65.1.54.123:2000"), []);

  const [attchedfiles, setAttchedfiles] = useState(null);
  const [description, setDescription] = useState("");
  const [Status, setStatus] = useState("");
  const [TicketQuery, setTicketQuery] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [subDepartments, setSubDepartments] = useState([]);
  const [selectedSubDepartmentId, setSelectedSubDepartmentId] = useState("");
  const [showTransferSection, setShowTransferSection] = useState(false);

  const handelTransfer = () => {
    setShowTransferSection(!showTransferSection);
  };

  const { userInfo } = useSelector((state) => state.user);
  const { DepSub } = useSelector((state) => state.QueryCatSubHierarchy);
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");

  const decoded = jwtDecode(token);
  const [formData, setFormData] = useState({
    // TicketID: TicketData.TicketID,
    // ResolutionDescription: "",
    // claim_User_Id: decoded.user_id,
  });

  useEffect(() => {
    dispatch(DepSubHierachy());
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
      const currentDate = new Date();
      // Create form data to be sent to the server

      if (selectedDepartmentId) {
        const formDataToSend = {
          TicketID: TicketData.TicketID,
          TicketQuery: TicketQuery,
          ResolutionDescription: description,
          TransferredToDepartmentID: Number(selectedDepartmentId),
          TransferredToSubDepartmentID: Number(selectedSubDepartmentId),
          Resolution_Timestamp: currentDate.toISOString(),
          Status: Status,
          ResolvedAttachmentUrl: updatedAttachmentUrls,
          claim_User_Id: userInfo.user_id,
        };
        // dispatch(updatesTickets(formDataToSend));
        socket.emit("updateTicket", {
          AssignedToSubDepartmentID: formDataToSend.TransferredToSubDepartmentID,
          formData: formDataToSend,
        });

        console.log(formDataToSend)
      } else {
        const formDataToSend = {
          TicketID: TicketData.TicketID,
          TicketQuery: TicketQuery,
          ResolutionDescription: description,
          Resolution_Timestamp: currentDate.toISOString(),
          Status: Status,
          ResolvedAttachmentUrl: updatedAttachmentUrls,
          claim_User_Id: userInfo.user_id,
        };
        socket.emit("updateTicket", {
          AssignedToSubDepartmentID: TicketData.TicketID,
          formData: formDataToSend,
        });
        console.log(formDataToSend)

      }

      setDescription("");
      setAttchedfiles(null);
      setStatus("");
      setTicketQuery("");

      // setShowForm(false);
    } catch (error) {
      console.error("Error creating ticket:", error);
    }
  };

  useEffect(() => {
    socket.on("updatedticketData", (data) => {
      console.log("Ticket update 127  :", data);
      dispatch(updateForAdminTicket(data));
    });


    socket.on("ticketUpdatedReciverd", (data) => {
      console.log("Ticket updated successfully:", data);
      dispatch(updateForAdminTicket(data));
      // dispatch(claimAdminTicketRemoveAfterTF(data));

    });
    
    return () => {
      socket.disconnect();
    };
  }, [socket]);


  useEffect(() => {
    if (selectedDepartmentId) {
      // Find the selected department and set its subdepartments
      const selectedDepartment = DepSub.find(
        (dept) => dept.DepartmentID === parseInt(selectedDepartmentId)
      );
      setSubDepartments(
        selectedDepartment ? selectedDepartment.SubDepartments : []
      );
      setSelectedSubDepartmentId(""); // Reset selected subdepartment when department changes
    } else {
      setSubDepartments([]);
    }
  }, [selectedDepartmentId]);

  const handleDepartmentChange = (event) => {
    setSelectedDepartmentId(event.target.value);
  };

  const handleSubDepartmentChange = (event) => {
    setSelectedSubDepartmentId(event.target.value);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="flex justify-between">
          {decoded.DepartmentID === 2 ? (
            <>
              <button
                onClick={handelTransfer}
                className="bg-orange-500 text-white hover:bg-orange-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                {showTransferSection ? "Not Transfer" : "Transfer"}
              </button>
              {showTransferSection ? (
                <>
                  {" "}
                  <div>
                    <div className="mb-2">
                      <label htmlFor="department">Select Department:</label>
                      <select
                        id="department"
                        name="department"
                        value={selectedDepartmentId}
                        onChange={handleDepartmentChange}
                        className="mt-1 p-1 w-full border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                      >
                        <option value="">--Select Department--</option>
                        {DepSub.map((department) => (
                          <option
                            key={department.DepartmentID}
                            value={department.DepartmentID}
                          >
                            {department.DepartmentName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-2">
                      <label htmlFor="subdepartment">
                        Select SubDepartment:
                      </label>
                      <select
                        id="subdepartment"
                        name="subdepartment"
                        value={selectedSubDepartmentId}
                        onChange={handleSubDepartmentChange}
                        className="mt-1 p-1 w-full border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                      >
                        <option value="">--Select SubDepartment--</option>
                        {subDepartments.map((subDepartment) => (
                          <option
                            key={subDepartment.SubDepartmentID}
                            value={subDepartment.SubDepartmentID}
                          >
                            {subDepartment.SubDepartmentName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>{" "}
                </>
              ) : (
                <>
                  <h1>
                    Click Transfer button To Transfer Ticket to Other Department
                  </h1>
                </>
              )}
            </>
          ) : (
            <></>
          )}
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
          <label
            htmlFor="Status"
            className="block text-sm font-medium text-gray-700"
          >
            Ticket Status
          </label>

          <select
            id="Status"
            name="Status"
            onChange={(e) => setStatus(e.target.value)}
            value={Status}
            className="mt-1 p-1 w-full border rounded-md focus:outline-none focus:ring focus:border-blue-300"
          >
            <option value="">{Status}</option>
            <option value="Pending">Pending</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
        <div className="mb-2">
          <label
            htmlFor="Status"
            className="block text-sm font-medium text-gray-700"
          >
            Transaction or Issue
          </label>

          <select
            id="TicketQuery"
            name="TicketQuery"
            onChange={(e) => setTicketQuery(e.target.value)}
            value={Status}
            className="mt-1 p-1 w-full border rounded-md focus:outline-none focus:ring focus:border-blue-300"
          >
            <option value="">{TicketQuery}</option>
            <option value="Transaction">Transaction</option>
            <option value="Issue">Issue</option>
          </select>
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
        {description.length > 0 ? (
          <>
            {showTransferSection ? (
              <>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Transfer
                </button>
              </>
            ) : (
              <>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  reply
                </button>
              </>
            )}
          </>
        ) : (
          <></>
        )}
      </form>
    </>
  );
}

export default Resolution;
