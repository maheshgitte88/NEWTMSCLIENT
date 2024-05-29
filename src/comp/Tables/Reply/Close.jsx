import React, { useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { updatesTickets } from "../../../reduxToolkit/features/TicketSlice";

function Close({ TicketData }) {
  const [attchedfiles, setAttchedfiles] = useState(null);
  const [description, setDescription] = useState("");
  const [starsFeedback, setStarsFeedback] = useState(0); // Initial state set to 0
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({});

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

      const defaultDescription =
        starsFeedback > 6
          ? `Closed with ${starsFeedback} Stars`
          : "Query not resolved fully";
      const formDataToSend = {
        TicketID: TicketData.TicketID,
        CloseDescription: description || defaultDescription,
        ResolutionFeedback: starsFeedback,
        Status: "Closed",
        closed_Timestamp: currentDate.toISOString(),
      };

      dispatch(updatesTickets(formDataToSend));
      setDescription("");
      setStarsFeedback(0);
      setAttchedfiles(null);
      // setShowForm(false);
    } catch (error) {
      console.error("Error creating ticket:", error);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 10; i++) {
      stars.push(
        <div className="grid justify-items-center w-full border">
          <span
            key={i}
            className={`cursor-pointer text-3xl ${
              i <= starsFeedback
                ? starsFeedback < 7
                  ? "text-red-500"
                  : "text-green-500"
                : "text-gray-400"
            }`}
            onClick={() => setStarsFeedback(i)}
          >
            ★
          </span>
        </div>
      );
    }
    return stars;
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="mb-2 flex justify-center">{renderStars()}</div>

        <div className="mb-2">
          <textarea
            id="description"
            name="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 p-5 w-full border-dashed border-4 border-indigo-300 rounded-md focus:outline-none focus:ring focus:border-blue-600"
            placeholder="Enter a brief description"
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
        {starsFeedback > 0 ? (
          <>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Close Ticket
            </button>
          </>
        ) : (
          <></>
        )}
      </form>
    </>
  );
}

export default Close;
