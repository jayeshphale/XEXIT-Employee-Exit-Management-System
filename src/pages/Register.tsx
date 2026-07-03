import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  MenuItem,
  useTheme,
  InputAdornment,
} from "@mui/material";
import { ShieldCheck, UserPlus, Info, Calendar, Briefcase, Mail, Lock } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store";
import { registerUser } from "../store/authSlice";
import { toast } from "react-hot-toast";
import { User } from "../types";

type RegisterFormInputs = Omit<User, "id" | "role"> & { password?: string };

const DEPARTMENTS = [
  "Engineering",
  "Product Management",
  "Design",
  "Human Resources",
  "Marketing",
  "Sales",
  "Finance",
  "Operations",
  "Legal",
];

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "IN", name: "India" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "AU", name: "Australia" },
  { code: "SG", name: "Singapore" },
];

export default function Register() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    defaultValues: {
      joiningDate: new Date().toISOString().substring(0, 10),
    },
  });

  const onSubmit = async (data: RegisterFormInputs) => {
    // Perform registration
    const resultAction = await dispatch(registerUser(data));

    if (registerUser.fulfilled.match(resultAction)) {
      toast.success("Registration successful!");
      navigate("/dashboard");
    } else {
      toast.error((resultAction.payload as string) || "Registration failed. Please check your data.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 6,
        px: 3,
        background:
          theme.palette.mode === "dark"
            ? "radial-gradient(circle at 10% 20%, rgba(17, 24, 39, 1) 0%, rgba(8, 10, 15, 1) 90%)"
            : "radial-gradient(circle at 10% 20%, rgba(243, 244, 246, 1) 0%, rgba(229, 231, 235, 1) 90%)",
      }}
    >
      <Card
        id="register-card"
        sx={{
          maxWidth: 700,
          width: "100%",
          boxShadow: "0 20px 45px rgba(0, 0, 0, 0.15)",
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          {/* Brand Header */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 4, gap: 1 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                color: "white",
                boxShadow: "0px 8px 16px rgba(59, 130, 246, 0.2)",
              }}
            >
              <UserPlus size={26} />
            </Box>
            <Typography id="register-title" variant="h4" sx={{ fontWeight: 800, mt: 1.5, textAlign: "center" }}>
              Join XEXIT
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
              Create an employee profile to get started
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" icon={<Info size={18} />} sx={{ mb: 4, borderRadius: "10px" }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <form id="register-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <TextField
                  id="firstName"
                  label="First Name"
                  fullWidth
                  variant="outlined"
                  {...register("firstName", { required: "First name is required" })}
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                />
              </div>

              <div>
                <TextField
                  id="lastName"
                  label="Last Name"
                  fullWidth
                  variant="outlined"
                  {...register("lastName", { required: "Last name is required" })}
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                />
              </div>

              <div>
                <TextField
                  id="email"
                  label="Email Address"
                  type="email"
                  fullWidth
                  variant="outlined"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Mail size={16} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </div>

              <div>
                <TextField
                  id="password"
                  label="Password"
                  type="password"
                  fullWidth
                  variant="outlined"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Password must be at least 6 characters" },
                  })}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock size={16} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </div>

              <div>
                <TextField
                  id="employeeId"
                  label="Employee ID"
                  placeholder="e.g. EMP123"
                  fullWidth
                  variant="outlined"
                  {...register("employeeId", { required: "Employee ID is required" })}
                  error={!!errors.employeeId}
                  helperText={errors.employeeId?.message}
                />
              </div>

              <div>
                <TextField
                  id="phoneNumber"
                  label="Phone Number"
                  placeholder="+1 (555) 019-2834"
                  fullWidth
                  variant="outlined"
                  {...register("phoneNumber", { required: "Phone number is required" })}
                  error={!!errors.phoneNumber}
                  helperText={errors.phoneNumber?.message}
                />
              </div>

              <div>
                <TextField
                  id="country"
                  select
                  label="Country"
                  fullWidth
                  variant="outlined"
                  defaultValue="US"
                  {...register("country", { required: "Country is required" })}
                  error={!!errors.country}
                  helperText={errors.country?.message}
                >
                  {COUNTRIES.map((option) => (
                    <MenuItem key={option.code} value={option.code}>
                      {option.name}
                    </MenuItem>
                  ))}
                </TextField>
              </div>

              <div>
                <TextField
                  id="department"
                  select
                  label="Department"
                  fullWidth
                  variant="outlined"
                  defaultValue="Engineering"
                  {...register("department", { required: "Department is required" })}
                  error={!!errors.department}
                  helperText={errors.department?.message}
                >
                  {DEPARTMENTS.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </TextField>
              </div>

              <div>
                <TextField
                  id="designation"
                  label="Designation"
                  placeholder="e.g. Senior Software Engineer"
                  fullWidth
                  variant="outlined"
                  {...register("designation", { required: "Designation is required" })}
                  error={!!errors.designation}
                  helperText={errors.designation?.message}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Briefcase size={16} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </div>

              <div>
                <TextField
                  id="joiningDate"
                  label="Joining Date"
                  type="date"
                  fullWidth
                  variant="outlined"
                  {...register("joiningDate", { required: "Joining date is required" })}
                  error={!!errors.joiningDate}
                  helperText={errors.joiningDate?.message}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Calendar size={16} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <TextField
                  id="profileImage"
                  label="Profile Image URL (Optional)"
                  placeholder="https://images.unsplash.com/photo-..."
                  fullWidth
                  variant="outlined"
                  {...register("profileImage")}
                />
              </div>

              <div className="col-span-1 md:col-span-2 mt-4">
                <Button
                  id="register-submit-btn"
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={isLoading}
                  sx={{ py: 1.5, fontSize: "0.95rem" }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} sx={{ color: "white" }} />
                  ) : (
                    <>
                      Register Account
                      <ShieldCheck size={18} style={{ marginLeft: 8 }} />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>

          {/* Login link */}
          <Box sx={{ mt: 3.5, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{" "}
              <Link id="login-link" to="/login" style={{ color: theme.palette.primary.main, fontWeight: 600, textDecoration: "none" }}>
                Sign In
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
