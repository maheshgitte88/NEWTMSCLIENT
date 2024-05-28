
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// export const QueryCatSubHierarchyData = createAsyncThunk(
//     "QueryCatSubHierarchyData",
//     async (args, { rejectWithValue }) => {
//         try {
//             const res = await axios.get(`http://65.1.54.123:2000/get-query-hierarchy`);
//             const resData = res.data;
//             return resData;
//         } catch (error) {
//             return rejectWithValue(error);
//         }
//     }
// );

export const DepSubHierachy = createAsyncThunk(
    "DepSubHierachy",
    async (args, { rejectWithValue }) => {
        try {
            const res = await axios.get(`http://65.1.54.123:2000/api/dep-sub-hierarchy`);
            const resData = res.data.departments;
            console.log(resData, 24)
            return resData;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);


export const QueryCatSubData = createSlice({
    name: "QueryCatSubHierarchy",
    initialState: {
        // QueryCatSubHierarchy: [],
        DepSub:[],
        loading: false,
        error: null,
    },
    reducers: {}, // Use an empty `reducers` object if you don't have custom reducers
    extraReducers: (builder) => {
        builder
            // .addCase(QueryCatSubHierarchyData.pending, (state) => {
            //     state.loading = true;
            // })
            // .addCase(QueryCatSubHierarchyData.fulfilled, (state, action) => {
            //     state.loading = false;
            //     state.QueryCatSubHierarchy = action.payload;
            // })
            // .addCase(QueryCatSubHierarchyData.rejected, (state, action) => {
            //     state.loading = false;
            //     state.error = action.payload.message || "An error occurred"; // Handle potential missing error message
            // })
            .addCase(DepSubHierachy.pending, (state) => {
                state.loading = true;
            })
            .addCase(DepSubHierachy.fulfilled, (state, action) => {
                state.loading = false;
                state.DepSub = action.payload;
            })
            .addCase(DepSubHierachy.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload.message || "An error occurred"; // Handle potential missing error message
            });
    },
});
export default QueryCatSubData.reducer;