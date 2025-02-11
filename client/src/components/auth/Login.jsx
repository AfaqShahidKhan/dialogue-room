"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { useTheme } from "@/context/ThemeContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import { FaLock, FaGoogle } from "react-icons/fa";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { login } from "@/store/services/authService";
import Header from "../ui/Header";
import { useRouter } from "next/navigation";

const Login = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const isDarkMode = theme === "dark";
  const themeColors = isDarkMode ? "dark" : "light";

  const onSubmit = async (data) => {
    try {
      console.log("Form Data:", data);

      const response = await login(data);

      if (response.success) {
        toast.success("Login successfully!");
      }
      router.push('/')
    } catch (error) {
      console.error("Error during form submission:", error);
      const errorMessage =
        error.message || "An unexpected error occurred. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleGoogleLogin = () => {
    // This function will handle Google Login when implemented.
    console.log("Google login triggered");
  };

  return (
    <>
      <Header />
      <div className="min-h-screen flex justify-center items-center bg-muted">
        <div className="max-w-md w-full p-6 bg-background rounded-lg shadow-md">
          <h2
            className={`text-${themeColors}-foreground text-2xl font-bold mb-6 text-center`}
          >
            Login to Your Account
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="Enter your email"
              className=""
              required
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: "Invalid email address",
                },
              })}
              error={errors.email}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password"
              required
              className=""
              {...register("password", { required: "Password is required" })}
              error={errors.password}
            />

            <Button
              type="submit"
              className="w-full flex items-center justify-center bg-primary text-white"
            >
              <FaLock className="mr-2" />
              Login
            </Button>
          </form>

          {/* Forgot Password Link */}
          <div className="mt-4 text-center">
            <Link
              href="/forgot-password"
              className={`text-${themeColors}-primary underline text-sm`}
            >
              Forgot Password?
            </Link>
          </div>

          {/* Google Login */}
          <div className="mt-6">
            <Button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center bg-blue-600 text-white"
            >
              <FaGoogle className="mr-2" />
              Login with Google
            </Button>
          </div>

          <div className="mt-4 text-center">
            <p className={`text-${themeColors}-foreground text-sm`}>
              Don't have an account?
              <Link
                href="/register"
                className={`text-${themeColors}-primary underline`}
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
