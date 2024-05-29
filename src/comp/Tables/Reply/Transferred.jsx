import React, { useEffect, useMemo, useRef, useState } from "react";

import { jwtDecode } from "jwt-decode";
import { useDispatch, useSelector } from "react-redux";
import { updatesTickets } from "../../../reduxToolkit/features/AdminSlice";

function Transferred({ TicketData }) {
  const [attchedfiles, setAttchedfiles] = useState(null);
  const [description, setDescription] = useState("");
  const [Status, setStatus] = useState("Pending");
  const [TicketQuery, setTicketQuery] = useState("Transaction");

  const { userInfo } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  const token = localStorage.getItem("token");

  const decoded = jwtDecode(token);
  const [formData, setFormData] = useState({
    TicketID: TicketData.TicketID,
    TransferDescription: "",
    transferred_Claim_User_id: decoded.user_id,
  });

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
      
      const currentDate = new Date();
      // Create form data to be sent to the server
      const formDataToSend = {
        TicketID: TicketData.TicketID,
        TicketQuery: TicketQuery,
        TransferDescription: description,
        transferred_Timestamp: currentDate.toISOString(),
        Status: Status,
        TransferdAttachmentUrl: updatedAttachmentUrls,
        transferred_Claim_User_id: userInfo.user_id,
      };

      // socket.emit("createTicket", {
      //   // createTicket: formDataToSend,
      //   AssigSubDepId: 5,
      // });

      dispatch(updatesTickets(formDataToSend));
      setDescription("");
      setAttchedfiles(null);
      setStatus('');
      // setShowForm(false);
    } catch (error) {
      console.error("Error creating ticket:", error);
    }
  };

  return (
    <>
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
            <option value="">{TicketQuery}</option>
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
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Reply
            </button>
          </>
        ) : (
          <></>
        )}
      </form>
    </>
  );
}

export default Transferred;
