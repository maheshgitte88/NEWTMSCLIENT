import React, { useState } from "react";
import axios from 'axios';
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const { login } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("https://13.235.240.117:2000/api/login", {
        email,
        password,
      });
      login(response.data.token);
      // Extract the token from the response
      const { token } = response.data;
      // Save the token to local storage
      localStorage.setItem("token", token);
      // Handle successful login
      toast.success('Logged in successfully..!');

      const tokens = localStorage.getItem("token");
      const decoded = jwtDecode(tokens);
      if (decoded.user_Roal === "Employee") {
        navigate("/admin/home");
      } else {
        navigate("/user/Ticket");
      }
    //   console.log("Logged in successfully:", token);

    } catch (error) {
      // Handle login error
      console.error("Login failed:", error.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-orange-400">
      <div className="bg-orange-300 p-8 rounded-lg shadow-md max-w-md w-full m-2">
        <div
          className="bg-cover bg-center h-16 rounded-t-lg"
          style={{
            backgroundImage:
              "url('https://res.cloudinary.com/dtgpxvmpl/image/upload/v1702100329/mitsde_logo_vmzo63.png')",
          }}
        ></div>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="mb-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full p-2 border rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              placeholder="Password"
              className="w-full p-2 border rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-300"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
