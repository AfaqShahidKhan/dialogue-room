"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useTheme } from "@/context/ThemeContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import { FaUser, FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { signup } from "@/store/services/authService";

const Register = () => {
  const { theme } = useTheme();
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      agree: false,
    },
  });
  const isDarkMode = theme === "dark";

  const passwordValue = watch("password");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = async (data) => {
    try {
      console.log("Form Data:", data);

      if (data.agree !== true) {
        toast.error("Checkbox value is not registering as true.");
        return;
      }

      const response = await signup(data);

      if (response.success) {
        toast.success("Account created successfully!");
      }
    } catch (error) {
      console.error("Error during form submission:", error);
      const errorMessage =
        error.message || "An unexpected error occurred. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleGoogleLogin = () => {
    console.log("Google login triggered");
    toast.success("Google login initiated!");
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-muted">
      <div className="max-w-md w-full p-6 bg-background rounded-lg shadow-md">
        <h2
          className={`text-2xl font-bold mb-3 text-center ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Create an Account
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            {...register("name", { required: "Name is required" })}
            error={errors.name}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            {...register("email", { required: "Email is required" })}
            error={errors.email}
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              {...register("password", { required: "Password is required" })}
              error={errors.password}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="relative">
            <Input
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              {...register("passwordConfirm", {
                required: "Confirm password is required",
                validate: (value) =>
                  value === passwordValue || "Passwords do not match",
              })}
              error={errors.passwordConfirm}
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.passwordConfirm && (
            <p className="text-red-500 text-sm">
              {errors.passwordConfirm.message}
            </p>
          )}

          <Checkbox
            label="I agree to the terms and conditions"
            {...register("agree", {
              required: "You must agree to the terms",
            })}
          />

          {errors.agree && (
            <p className="text-red-500 text-sm">{errors.agree.message}</p>
          )}

          <Button
            type="submit"
            className="w-full flex items-center justify-center bg-primary text-white"
          >
            <FaUser className="mr-2" />
            Register
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p
            className={`text-sm ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 underline">
              Login here
            </Link>
          </p>
        </div>

        <div className="mt-6">
          <Button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center bg-blue-600 text-white"
          >
            <FaGoogle className="mr-2" />
            Sign up with Google
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Register;
