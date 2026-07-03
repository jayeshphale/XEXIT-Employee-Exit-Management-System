import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  Divider,
  Paper,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { Eye, EyeOff, ShieldAlert, LogIn, Sparkles, UserCheck } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store";
import { loginUser, seedDemoAdmin, clearAuthError } from "../store/authSlice";
import { toast } from "react-hot-toast";

interface LoginFormInputs {
  emailOrUsername?: string;
  password?: string;
}

export default function Login() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated, user } = useAppSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (data: LoginFormInputs) => {
    const input = data.emailOrUsername?.trim() || "";
    const pass = data.password || "";

    // Normal API call (the backend accepts both employee email and HR admin username)
    const resultAction = await dispatch(
      loginUser({
        email: input.includes("@") ? input : undefined,
        username: !input.includes("@") ? input : undefined,
        password: pass,
      })
    );

    if (loginUser.fulfilled.match(resultAction)) {
      toast.success("Successfully logged in!");
    } else {
      toast.error((resultAction.payload as string) || "Invalid credentials. Please try again.");
    }
  };

  const handleFillDemoAdmin = () => {
    setValue("emailOrUsername", "admin");
    setValue("password", "admin");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
        background:
          theme.palette.mode === "dark"
            ? "radial-gradient(circle at 10% 20%, rgba(17, 24, 39, 1) 0%, rgba(8, 10, 15, 1) 90%)"
            : "radial-gradient(circle at 10% 20%, rgba(243, 244, 246, 1) 0%, rgba(229, 231, 235, 1) 90%)",
      }}
    >
      <Card
        id="login-card"
        sx={{
          maxWidth: 450,
          width: "100%",
          boxShadow: "0 20px 45px rgba(0, 0, 0, 0.15)",
          border: `1px solid ${theme.palette.divider}`,
          overflow: "visible",
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4.5 } }}>
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
              <LogIn size={26} />
            </Box>
            <Typography id="login-welcome-title" variant="h4" sx={{ fontWeight: 800, mt: 1.5, textAlign: "center" }}>
              Welcome to XEXIT
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
              Employee Exit Management System
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" icon={<ShieldAlert size={18} />} sx={{ mb: 3, borderRadius: "10px" }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <form id="login-form" onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3.25 }}>
              <TextField
                id="email-input"
                label="Email or Username"
                placeholder="Enter email or admin"
                fullWidth
                variant="outlined"
                {...register("emailOrUsername", { required: "Email or username is required" })}
                error={!!errors.emailOrUsername}
                helperText={errors.emailOrUsername?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start" sx={{ pl: 0.5 }}>
                        <UserCheck size={18} style={{ color: theme.palette.text.secondary }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                id="password-input"
                label="Password"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                fullWidth
                variant="outlined"
                {...register("password", { required: "Password is required" })}
                error={!!errors.password}
                helperText={errors.password?.message}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Button
                id="login-submit-btn"
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{ py: 1.5, fontSize: "0.95rem" }}
              >
                {isLoading ? (
                  <CircularProgress size={24} sx={{ color: "white" }} />
                ) : (
                  <>
                    Sign In
                    <LogIn size={18} style={{ marginLeft: 8 }} />
                  </>
                )}
              </Button>
            </Box>
          </form>

          <Divider sx={{ my: 3.5 }}>
            <Typography variant="caption" color="text.secondary">
              OR
            </Typography>
          </Divider>

          {/* HR Bypass Button for convenient testing */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: "12px",
              bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.02)" : "rgba(15, 23, 42, 0.02)",
              borderStyle: "dashed",
              textAlign: "center",
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1, fontWeight: 500 }}>
              Need to evaluate the HR Admin side?
            </Typography>
            <Button
              id="bypass-hr-btn"
              variant="text"
              size="small"
              color="secondary"
              startIcon={<Sparkles size={14} />}
              onClick={handleFillDemoAdmin}
              sx={{ fontWeight: 600 }}
            >
              Use HR Admin (admin/admin)
            </Button>
          </Paper>

          {/* Sign up link */}
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{" "}
              <Link id="register-link" to="/register" style={{ color: theme.palette.primary.main, fontWeight: 600, textDecoration: "none" }}>
                Register here
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
