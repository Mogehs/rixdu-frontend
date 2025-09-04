import React, { useState, useEffect } from "react";
import { Logo } from "../../assets";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../features/auth/authSlice";
import { useAuthState } from "../../hooks/useAuthState";
import { useAuth0 } from "@auth0/auth0-react";
import { auth0Login } from "../../features/auth/authSlice";
import { useLocation } from "react-router-dom";

import {
  setUser,
  setToken,
  setAuthenticated,
} from "../../features/auth/authSlice";

const LoginPage = () => {
  const location = useLocation();

  const {
    loginWithRedirect,
    isAuthenticated,
    getAccessTokenSilently,
    isLoading,
  } = useAuth0();
  const token = useSelector((state) => state.auth.token);
  const [loginMethod, setLoginMethod] = useState("email");
  const [formData, setFormData] = useState({
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Using the custom hook for safe auth state access
  const { loading, error } = useAuthState();

  const handleMethodChange = (method) => {
    setLoginMethod(method);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (loginMethod === "email") {
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    } else {
      if (!formData.phoneNumber.trim()) {
        newErrors.phoneNumber = "Phone number is required";
      } else if (!/^[0-9]{10,15}$/.test(formData.phoneNumber)) {
        newErrors.phoneNumber = "Please enter a valid phone number";
      }
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const credentials = {
      password: formData.password,
    };

    if (loginMethod === "email") {
      credentials.email = formData.email;
    } else {
      credentials.phoneNumber = formData.phoneNumber;
    }

    try {
      const resultAction = await dispatch(loginUser(credentials));
      if (loginUser.fulfilled.match(resultAction)) {
        // Login successful, redirect to home or dashboard
        navigate("/");
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  // Separate button handlers
  const handleGoogleLogin = () => {
    loginWithRedirect({
      authorizationParams: {
        connection: "google-oauth2",
        prompt: "login",
      },
      appState: { returnTo: "/", fromAuth0: true },
    });
  };

  const handleAppleLogin = () => {
    loginWithRedirect({
      authorizationParams: {
        connection: "apple",
        prompt: "login",
      },
      appState: { returnTo: "/", fromAuth0: true },
    });
  };

  return (
    <div className="section-container max-w-[550px] mx-auto mt-10 p-10 bg-white rounded-lg shadow-lg">
      <div className="flex justify-center mb-6">
        <Link to="/">
          <img src={Logo} alt="Website Logo" className="h-20 w-20" />
        </Link>
      </div>
      <h2 className="section-heading text-3xl font-bold mb-6 text-center">
        Welcome Back
      </h2>
      <p className="mb-8 text-gray-600 text-center">
        Please login to your account to continue.
      </p>
      <div className="flex mb-6">
        <button
          type="button"
          onClick={() => handleMethodChange("email")}
          className={`flex-1 py-2 text-center font-medium ${
            loginMethod === "email"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-gray-500 border-b border-gray-300"
          }`}
        >
          Email
        </button>
        <button
          type="button"
          onClick={() => handleMethodChange("phone")}
          className={`flex-1 py-2 text-center font-medium ${
            loginMethod === "phone"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-gray-500 border-b border-gray-300"
          }`}
        >
          Phone Number
        </button>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {loginMethod === "email" ? (
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-dark mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>
        ) : (
          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-dark mb-2"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Enter your phone number"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
            )}
          </div>
        )}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-dark mb-2"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>
        <div className="flex justify-end">
          <Link
            to="/auth/forgot-password"
            className="text-blue-500 hover:underline text-sm"
          >
            Forgot Password?
          </Link>
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button
          type="submit"
          className="w-full py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-300"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Login"}
        </button>{" "}
        <div className="my-6 border-t border-gray-300 pt-6">
          <p className="text-center text-gray-500 text-sm mb-4">
            Or continue with
          </p>
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full mb-3 py-3 px-4 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>
          <button
            type="button"
            onClick={handleAppleLogin}
            className="w-full py-3 px-4 bg-black text-white font-medium rounded-lg hover:bg-gray-900 transition-all duration-200 flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            Continue with Apple
          </button>
        </div>
      </form>

      <p className="mt-8 text-center text-gray-600">
        Don't have an account?{" "}
        <Link
          to="/auth/verify-method"
          className="text-blue-500 hover:underline"
        >
          Sign up here
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
