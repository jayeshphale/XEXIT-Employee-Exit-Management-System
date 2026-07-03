import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { User, ShieldAlert, KeyRound, Save, BadgeCheck } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store";
import { updateUserProfile, changeUserPassword, clearAuthError } from "../store/authSlice";
import { toast } from "react-hot-toast";

interface ProfileFormInputs {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profileImage?: string;
}

interface PasswordFormInputs {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export default function Profile() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { user, isLoading, error } = useAppSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState(0);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormInputs>();

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    watch: watchPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormInputs>();

  // Sync state when user profile loads
  useEffect(() => {
    if (user) {
      resetProfile({
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        profileImage: user.profileImage || "",
      });
    }
  }, [user, resetProfile]);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [activeTab, dispatch]);

  const onProfileSubmit = async (data: ProfileFormInputs) => {
    const resultAction = await dispatch(updateUserProfile(data));
    if (updateUserProfile.fulfilled.match(resultAction)) {
      toast.success("Profile updated successfully!");
    } else {
      toast.error((resultAction.payload as string) || "Failed to update profile.");
    }
  };

  const onPasswordSubmit = async (data: PasswordFormInputs) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }

    const resultAction = await dispatch(
      changeUserPassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
    );

    if (changeUserPassword.fulfilled.match(resultAction)) {
      toast.success("Password updated successfully!");
      resetPassword();
    } else {
      toast.error((resultAction.payload as string) || "Failed to update password.");
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography id="profile-title" variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Account Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure personal profile details and security settings below
        </Typography>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Card: Summary Avatar */}
        <div className="col-span-1 md:col-span-4">
          <Card
            id="profile-summary-card"
            sx={{
              textAlign: "center",
              py: 5,
              px: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Avatar
              id="profile-avatar"
              src={user?.profileImage}
              sx={{
                width: 110,
                height: 110,
                border: `3.5px solid ${theme.palette.primary.main}`,
                fontSize: "2.5rem",
                bgcolor: theme.palette.primary.main,
                mb: 1.5,
              }}
            >
              {user?.firstName ? user.firstName[0].toUpperCase() : "U"}
            </Avatar>
            <Box>
              <Typography id="profile-full-name" variant="h5" sx={{ fontWeight: 700 }}>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mt: 0.5 }}>
                {user?.role === "admin" ? "HR Admin" : user?.designation || "Employee"}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                Department: {user?.department || "Unassigned"}
              </Typography>
            </Box>

            <Box
              sx={{
                mt: 1,
                py: 1,
                px: 2,
                borderRadius: "8px",
                bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                border: `1px solid ${theme.palette.divider}`,
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <BadgeCheck size={16} className="text-green-500" />
              <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                Active Employee Profile
              </Typography>
            </Box>
          </Card>
        </div>

        {/* Right Card: Tabs Form Configuration */}
        <div className="col-span-1 md:col-span-8">
          <Card id="profile-tabs-card" sx={{ overflow: "hidden" }}>
            <Tabs
              value={activeTab}
              onChange={(e, val) => setActiveTab(val)}
              variant="fullWidth"
              sx={{
                borderBottom: `1px solid ${theme.palette.divider}`,
                "& .MuiTab-root": { py: 2, fontWeight: 600 },
              }}
            >
              <Tab icon={<User size={18} />} iconPosition="start" label="Personal Profile" />
              <Tab icon={<KeyRound size={18} />} iconPosition="start" label="Security" />
            </Tabs>

            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              {error && (
                <Alert severity="error" icon={<ShieldAlert size={18} />} sx={{ mb: 3.5, borderRadius: "10px" }}>
                  {error}
                </Alert>
              )}

              {/* TAB 0: Personal Profile */}
              {activeTab === 0 && (
                <form id="profile-details-form" onSubmit={handleSubmitProfile(onProfileSubmit)}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <TextField
                        id="profile-firstName"
                        label="First Name"
                        fullWidth
                        {...registerProfile("firstName", { required: "First name is required" })}
                        error={!!profileErrors.firstName}
                        helperText={profileErrors.firstName?.message}
                      />
                    </div>

                    <div>
                      <TextField
                        id="profile-lastName"
                        label="Last Name"
                        fullWidth
                        {...registerProfile("lastName", { required: "Last name is required" })}
                        error={!!profileErrors.lastName}
                        helperText={profileErrors.lastName?.message}
                      />
                    </div>

                    <div>
                      <TextField
                        id="profile-email"
                        label="Email Address"
                        fullWidth
                        disabled
                        value={user?.email || ""}
                        helperText="Corporate email address cannot be changed."
                        slotProps={{
                          input: {
                            readOnly: true,
                          },
                        }}
                      />
                    </div>

                    <div>
                      <TextField
                        id="profile-phoneNumber"
                        label="Phone Number"
                        fullWidth
                        {...registerProfile("phoneNumber", { required: "Phone number is required" })}
                        error={!!profileErrors.phoneNumber}
                        helperText={profileErrors.phoneNumber?.message}
                      />
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                      <TextField
                        id="profile-image-url"
                        label="Profile Image URL"
                        placeholder="https://images.unsplash.com/..."
                        fullWidth
                        {...registerProfile("profileImage")}
                      />
                    </div>

                    <div className="col-span-1 sm:col-span-2 mt-2">
                      <Button
                        id="profile-save-btn"
                        type="submit"
                        variant="contained"
                        disabled={isLoading}
                        startIcon={<Save size={18} />}
                        sx={{ py: 1.25, px: 3 }}
                      >
                        {isLoading ? <CircularProgress size={20} sx={{ color: "white" }} /> : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                </form>
              )}

              {/* TAB 1: Password Configuration */}
              {activeTab === 1 && (
                <form id="profile-password-form" onSubmit={handleSubmitPassword(onPasswordSubmit)}>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 3.25 }}>
                    <TextField
                      id="current-password"
                      label="Current Password"
                      type="password"
                      fullWidth
                      {...registerPassword("currentPassword", { required: "Current password is required" })}
                      error={!!passwordErrors.currentPassword}
                      helperText={passwordErrors.currentPassword?.message}
                    />

                    <TextField
                      id="new-password"
                      label="New Password"
                      type="password"
                      fullWidth
                      {...registerPassword("newPassword", {
                        required: "New password is required",
                        minLength: { value: 6, message: "New password must be at least 6 characters" },
                      })}
                      error={!!passwordErrors.newPassword}
                      helperText={passwordErrors.newPassword?.message}
                    />

                    <TextField
                      id="confirm-password"
                      label="Confirm New Password"
                      type="password"
                      fullWidth
                      {...registerPassword("confirmPassword", {
                        required: "Please confirm your new password",
                        validate: (val) => val === watchPassword("newPassword") || "Passwords do not match",
                      })}
                      error={!!passwordErrors.confirmPassword}
                      helperText={passwordErrors.confirmPassword?.message}
                    />

                    <Box sx={{ mt: 1 }}>
                      <Button
                        id="password-save-btn"
                        type="submit"
                        variant="contained"
                        disabled={isLoading}
                        startIcon={<KeyRound size={18} />}
                        sx={{ py: 1.25, px: 3 }}
                      >
                        {isLoading ? <CircularProgress size={20} sx={{ color: "white" }} /> : "Update Password"}
                      </Button>
                    </Box>
                  </Box>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Box>
  );
}
