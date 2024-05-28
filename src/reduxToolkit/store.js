import { configureStore } from "@reduxjs/toolkit";
import AdminSlice from './features/AdminSlice'
// import UserSlice from './features/UserSlice'
import QueryCatSubData from "./features/QueryDataSlices";
import userReducer  from './features/UserSlice'
import TicketSlice from "./features/TicketSlice";
// import userReducer from './features/UserSlice';


export const store = configureStore({
    reducer: {
        AdminTickets: AdminSlice,
        user: userReducer,
        UserTickets: TicketSlice,
        QueryCatSubHierarchy: QueryCatSubData,
        // StudentsTickets:StuTickets

    },
});