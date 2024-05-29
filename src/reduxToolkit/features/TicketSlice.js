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
            const result = response.data.ticket;
            return result;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);


export const getUserCreatedTicket = createAsyncThunk(
    "getAdminAssignedTicket",
    async ({ user_id }, { rejectWithValue }) => {
        try {
            const res = await axios.get(
                `https://13.235.240.117:2000/api/tickets/${user_id}`
            );
            const resData = res.data.tickets;
            return resData;
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



export const TicketSlice = createSlice({
    name: "UserTicketDetails",
    initialState: {
        UserTickets: [],
        
        // DTClosedickets: [],
        // DTResolvedickets: [],
        loading: false,
        error: null,
    },
    reducers: {
        updateStudentTicketsArray: (state, action) => {
            state.UserTickets.push(action.payload);
        },
        updateForStudentTicket: (state, action) => {
            const ticketIndex = state.UserTickets.findIndex(ticket => ticket.TicketID === action.payload.TicketID);
            if (ticketIndex !== -1) {
              // Replace the existing ticket with the new ticket data
              state.UserTickets[ticketIndex] = action.payload;
            } else {
              // If the ticket doesn't exist, add it to the array
              state.UserTickets.push(action.payload);
            }
          },
        
        // updateTicket: (state, action) => {
        //   const updatedTickets = action.payload;
        //   state.DTickets = updatedTickets;
        // },

        // StatusResTicket: (state, action) => {
        //   const updatedTicketStatus = action.payload;
        //   console.log(updatedTicketStatus);
        //   const { TicketId, UpdateDescription } = updatedTicketStatus;

        //   // Find the index of the ticket in state.DTickets
        //   const ticketIndex = state.DTickets.findIndex(ticket => ticket.TicketID === TicketId);

        //   // Check if the ticket index is found
        //   if (ticketIndex !== -1 && state.DTickets[ticketIndex].Status === "Resolved") {
        //     // Update the UpdateDescription to ResolutionDescription
        //     state.DTickets[ticketIndex].ResolutionDescription = UpdateDescription;

        //     // Remove the ticket from DTickets
        //     const removedTicket = state.DTickets.splice(ticketIndex, 1);

        //     // Add the removed ticket to DTResolvedickets
        //     state.DTResolvedickets.push(removedTicket[0]);
        //   }
        // },
        // StatusResTicket: (state, action) => {
        //     const updatedTicketStatus = action.payload;
        //     console.log(updatedTicketStatus);
        //     const { TicketId } = updatedTicketStatus;

        //     // Find the index of the ticket in state.DTickets
        //     const ticketIndex = state.DTickets.findIndex(ticket => ticket.TicketID === TicketId);

        //     // If the ticket index is found, remove the ticket from the state
        //     if (ticketIndex !== -1) {
        //         state.DTickets.splice(ticketIndex, 1);
        //     }
        // },


        // updateDtTicketUpdate: (state, action) => {
        //     const updatedTicket = action.payload;
        //     const ticketIndex = state.DTickets.findIndex(ticket => ticket.TicketID === updatedTicket.TicketId);
        //     if (ticketIndex !== -1) {
        //         state.UserTickets[ticketIndex].TicketUpdates.push(updatedTicket);
        //     }
        // },
    }, // Use an empty `reducers` object if you don't have custom reducers

    extraReducers: (builder) => {
        builder
            .addCase(createTicket.pending, (state) => {
                state.loading = true;
            })
            .addCase(createTicket.fulfilled, (state, action) => {
                state.loading = false;
                state.UserTickets.push(action.payload);
            })
            .addCase(createTicket.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload.message || "An error occurred"; // Handle potential missing error message
            })
            .addCase(getUserCreatedTicket.pending, (state) => {
                state.loading = true;
            })
            .addCase(getUserCreatedTicket.fulfilled, (state, action) => {
                state.loading = false;
                state.UserTickets = action.payload;
            })
            .addCase(getUserCreatedTicket.rejected, (state, action) => {
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
                const index = state.UserTickets.findIndex(
                  (ticket) => ticket.TicketID === updatedTicket.TicketID
                );
        
                if (index !== -1) {
                  // Replace the existing ticket with the updated ticket
                  state.UserTickets[index] = updatedTicket;
                } else {
                  // If the ticket is not found, add it to the array (optional)
                  state.UserTickets.push(updatedTicket);
                }
              })
              .addCase(updatesTickets.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload.message || "An error occurred"; // Handle potential missing error message
              })
    },
});

export const { updateStudentTicketsArray, updateForStudentTicket, updateTicket, updateDtTicketUpdate, StatusResTicket } = TicketSlice.actions;
export default TicketSlice.reducer;