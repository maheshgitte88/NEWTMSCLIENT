import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const createTicket = createAsyncThunk(
  "createNewticket",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "https://13.235.240.117:2000/api/create-ticket",
        data
      );
      const result = response.data;
      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updatesTickets = createAsyncThunk(
  "updateTicket",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "https://13.235.240.117:2000/api/update-ticket",
        data
      );
      const result = response.data;
      return result;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

export const getAdminAssignedTicket = createAsyncThunk(
  "getAdminAssignedTicket",
  async ({ departmentId, SubDepartmentId }, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `https://13.235.240.117:2000/api/tickets/${departmentId}/${SubDepartmentId}`
      );
      const resData = res.data.tickets;
      return resData;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);




export const getAdminTicketFromOtherDep = createAsyncThunk(
  "getAdminTicketFromOtherDep",
  async ({ departmentId, SubDepartmentId }, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `https://13.235.240.117:2000/api/trs-tickets/${departmentId}/${SubDepartmentId}`
      );
      const resData = res.data.tickets;
      return resData;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getAdminTicketClaimed = createAsyncThunk(
  "getAdminClaimedTickets",
  async ({ user_id }, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `https://13.235.240.117:2000/api/emp-ticket/claimed/${user_id}`
      );
      const resData = res.data.tickets;
      return resData;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);



// export const getDepResolvedTicket = createAsyncThunk(
//   "getdepResTickets",
//   async ({ departmentId, SubDepartmentId, EmployeeID }, { rejectWithValue }) => {
//     try {
//       const res = await axios.get(
//         `https://13.235.240.117:2000/Ticket/department/Resolved/${departmentId}/${SubDepartmentId}/${EmployeeID}`
//       );
//       const resData = res.data.tickets;
//       return resData;
//     } catch (error) {
//       return rejectWithValue(error);
//     }
//   }
// );

// export const getDepClosedTicket = createAsyncThunk(
//   "getdepClosedTickets",
//   async ({ departmentId, SubDepartmentId, EmployeeID }, { rejectWithValue }) => {
//     try {
//       const res = await axios.get(
//         `https://13.235.240.117:2000/Ticket/department/Closed/${departmentId}/${SubDepartmentId}/${EmployeeID}`
//       );
//       const resData = res.data.tickets;
//       return resData;
//     } catch (error) {
//       return rejectWithValue(error);
//     }
//   }
// );



export const AdminSlice = createSlice({
  name: "DepTicketDetails",
  initialState: {
    AdminTickets: [],
    ResFromOtherDepTickets: [],
    AdminClaimedTickets: [],
    // DTClosedickets: [],
    // DTResolvedickets: [],
    loading: false,
    error: null,
  },
  reducers: {
    updateAdminTicket: (state, action) => {
      state.AdminTickets.push(action.payload);
    },
    updateForAdminTicket: (state, action) => {
      const ticketIndex = state.AdminTickets.findIndex(ticket => ticket.TicketID === action.payload.TicketID);
      if (ticketIndex !== -1) {
        // Replace the existing ticket with the new ticket data
        state.AdminTickets[ticketIndex] = action.payload;
      } else {
        // If the ticket doesn't exist, add it to the array
        state.AdminTickets.push(action.payload);
      }
    },
    updateForAdminOtherDepTicket: (state, action) => {
      const ticketIndex = state.ResFromOtherDepTickets.findIndex(ticket => ticket.TicketID === action.payload.TicketID);
      if (ticketIndex !== -1) {
        // Replace the existing ticket with the new ticket data
        state.ResFromOtherDepTickets[ticketIndex] = action.payload;
      } else {
        // If the ticket doesn't exist, add it to the array
        state.ResFromOtherDepTickets.push(action.payload);
      }
    },
    claimAdminTicketRemoveAfterTF: (state, action) => {
      state.AdminClaimedTickets = state.AdminClaimedTickets.filter(ticket => ticket.TicketID !== action.payload.TicketID);
      // Add additional logic to add the ticket to the claiming user's pending tickets list if necessary
    },

    // claimAdminTicket: (state, action) => {
    //   const ticketIndex = state.AdminTickets.findIndex(ticket => ticket.TicketID === action.payload.TicketID);
    //   if (ticketIndex !== -1) {
    //     // Remove the ticket from AdminTickets for all users
    //     const [claimedTicket] = state.AdminTickets.splice(ticketIndex, 1);

    //     // If the ticket is being claimed by the current user, add it to AdminClaimedTickets
    //     if (action.payload.currentUserId === action.payload.claim_User_Id) {
    //       state.AdminClaimedTickets.push(claimedTicket);
    //     }
    //   }
    // }, 

    claimAdminTicket: (state, action) => {
      const { TicketID, currentUserId } = action.payload;
      const ticketIndex = state.AdminTickets.findIndex(ticket => ticket.TicketID === TicketID);
      
      if (ticketIndex !== -1) {
        // Remove the ticket from AdminTickets
        const [claimedTicket] = state.AdminTickets.splice(ticketIndex, 1);
        // Set the claim_User_Id to currentUserId
        claimedTicket.claim_User_Id = currentUserId;
        // Add the ticket to AdminClaimedTickets if claimed by the current user
        if (currentUserId === claimedTicket.claim_User_Id) {
          state.AdminClaimedTickets.push(claimedTicket);
        }
      }
    },

  }, // Use an empty `reducers` object if you don't have custom reducers
  extraReducers: (builder) => {
    builder
      .addCase(createTicket.pending, (state) => {
        state.loading = true;
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.AdminTickets.push(action.payload);
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || "An error occurred"; // Handle potential missing error message
      })
      .addCase(updatesTickets.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatesTickets.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTicket = action.payload.ticket;

        // Find the index of the existing ticket
        const index = state.AdminTickets.findIndex(
          (ticket) => ticket.TicketID === updatedTicket.TicketID
        );

        if (index !== -1) {
          // Replace the existing ticket with the updated ticket
          state.AdminTickets[index] = updatedTicket;
        } else {
          // If the ticket is not found, add it to the array (optional)
          state.AdminTickets.push(updatedTicket);
        }
      })
      .addCase(updatesTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || "An error occurred"; // Handle potential missing error message
      })
      .addCase(getAdminAssignedTicket.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAdminAssignedTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.AdminTickets = action.payload;
      })
      .addCase(getAdminAssignedTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || "An error occurred";
      })
      .addCase(getAdminTicketFromOtherDep.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAdminTicketFromOtherDep.fulfilled, (state, action) => {
        state.loading = false;
        state.ResFromOtherDepTickets = action.payload;
      })
      .addCase(getAdminTicketFromOtherDep.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || "An error occurred";
      })
      .addCase(getAdminTicketClaimed.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAdminTicketClaimed.fulfilled, (state, action) => {
        state.loading = false;
        state.AdminClaimedTickets = action.payload;
      })
      .addCase(getAdminTicketClaimed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || "An error occurred"; // Handle potential missing error message
      })
  },
});

export const { updateAdminTicket, updateForAdminTicket, updateForAdminOtherDepTicket, updateTicket, claimAdminTicket, claimAdminTicketRemoveAfterTF, updateDtTicketUpdate, StatusResTicket } = AdminSlice.actions;
export default AdminSlice.reducer;