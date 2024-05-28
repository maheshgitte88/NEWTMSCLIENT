import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { useDispatch } from 'react-redux';
import { setUserInfo } from './reduxToolkit/features/UserSlice';
import { jwtDecode } from "jwt-decode";
import Login from "./Auth/Login";
import Registration from "./Auth/Registration";
import PrivateRoute from "./PrivateRoute";
import DashBord from "./comp/DashBord";
import Home from "./comp/Home";
import Ticket from "./comp/Ticket";

function App() {
  const dispatch = useDispatch();
  // const userInfo = useSelector((state) => state.user.userInfo);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      const decoded = jwtDecode(token);
      dispatch(setUserInfo(decoded));
    }
  }, []);

  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Registration />} />
        <Route path="/admin" element={<PrivateRoute />}>
          <Route path="home" element={<DashBord />}>
            <Route path="" element={<Home />}></Route>
            {/* <Route path="Ticket" element={<Ticket />}></Route> */}
            {/* <Route path="Reply" element={<Reply />}></Route>
            <Route path="Org" element={<Org />}></Route>
            <Route path="Team" element={<Team />}></Route> */}
          </Route>
        </Route>
        <Route path="/user" element={<PrivateRoute />}>
          <Route path="Ticket" element={<DashBord />}>
            {/* <Route path="" element={<Home />}></Route> */}
            <Route path="" element={<Ticket />}></Route>
            {/* <Route path="Reply" element={<Reply />}></Route>
            <Route path="Org" element={<Org />}></Route>
            <Route path="Team" element={<Team />}></Route> */}
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
