import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Avatar,
  Chip,
  LinearProgress,
  Alert,
  AlertTitle,
  Paper,
  Divider,
  useTheme,
} from "@mui/material";
import {
  Calendar,
  User,
  FileText,
  BadgeAlert,
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ClipboardCheck,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store";
import { fetchEmployeeResignations } from "../store/resignationSlice";

export default function EmployeeDashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { activeResignation, isLoading } = useAppSelector((state) => state.resignation);

  useEffect(() => {
    dispatch(fetchEmployeeResignations());
  }, [dispatch]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "error";
      default:
        return "warning";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 size={16} className="text-green-500" />;
      case "rejected":
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-amber-500" />;
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* Header Greeting Banner */}
      <Box
        id="dashboard-header"
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: "18px",
          background:
            theme.palette.mode === "dark"
              ? `linear-gradient(135deg, ${theme.palette.primary.dark}33 0%, ${theme.palette.secondary.dark}22 100%)`
              : `linear-gradient(135deg, ${theme.palette.primary.light}15 0%, ${theme.palette.secondary.light}10 100%)`,
          border: `1px solid ${theme.palette.divider}`,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          gap: 3,
        }}
      >
        <Avatar
          id="employee-large-avatar"
          src={user?.profileImage}
          sx={{
            width: 80,
            height: 80,
            border: `3px solid ${theme.palette.primary.main}`,
            fontSize: "2rem",
            bgcolor: theme.palette.primary.main,
          }}
        >
          {user?.firstName ? user.firstName[0].toUpperCase() : "U"}
        </Avatar>
        <Box sx={{ flexGrow: 1, textAlign: { xs: "center", sm: "left" } }}>
          <Typography id="employee-welcome-title" variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            Hello, {user?.firstName} {user?.lastName}!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, mb: 1.5 }}>
            {user?.designation} • {user?.department}
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: { xs: "center", sm: "left" }, gap: 1.5 }}>
            <Chip size="small" icon={<User size={14} />} label={`ID: ${user?.employeeId}`} variant="outlined" />
            <Chip
              size="small"
              icon={<Calendar size={14} />}
              label={`Joined: ${user?.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : ""}`}
              variant="outlined"
            />
          </Box>
        </Box>
      </Box>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Status Column */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
          {isLoading ? (
            <Card sx={{ p: 4, display: "flex", justifyContent: "center", alignItems: "center" }}>
              <LinearProgress sx={{ width: "100%", borderRadius: 4 }} />
            </Card>
          ) : !activeResignation ? (
            /* CASE 1: No Resignation Submitted */
            <Card id="no-resignation-card">
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
                  Resignation & Offboarding Status
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                  You do not have any active or submitted resignation requests in our records. If you are preparing to transition and leave the organization, please read through company compliance guidelines and proceed to initiate your formal resignation.
                </Typography>

                <Alert severity="info" sx={{ mb: 4, borderRadius: "10px" }}>
                  <AlertTitle sx={{ fontWeight: 600 }}>Standard Guidelines</AlertTitle>
                  1. Maintain professionalism during notice periods.<br />
                  2. All requested Last Working Dates must respect public holidays in your location.
                </Alert>

                <Button
                  id="start-resignation-btn"
                  component={Link}
                  to="/resignation/new"
                  variant="contained"
                  endIcon={<ArrowRight size={18} />}
                  sx={{ py: 1.25, px: 3 }}
                >
                  Submit Resignation Request
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* CASE 2: Resignation Submitted */
            <Card id="active-resignation-card">
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3, flexWrap: "wrap", gap: 2 }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Active Resignation Request
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Submitted on: {new Date(activeResignation.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Chip
                    id="resignation-status-chip"
                    icon={getStatusIcon(activeResignation.status)}
                    label={activeResignation.status.toUpperCase()}
                    color={getStatusColor(activeResignation.status)}
                    sx={{ fontWeight: 700, borderRadius: "8px" }}
                  />
                </Box>

                <Divider sx={{ mb: 3 }} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: "12px" }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                      Notice Period
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {activeResignation.noticePeriod} Days
                    </Typography>
                  </Paper>

                  <Paper variant="outlined" sx={{ p: 2, borderRadius: "12px" }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                      Reported Manager
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {activeResignation.managerName}
                    </Typography>
                  </Paper>

                  <Paper variant="outlined" sx={{ p: 2, borderRadius: "12px" }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                      Selected Last Working Date
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {new Date(activeResignation.lastWorkingDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </Typography>
                  </Paper>

                  <Paper variant="outlined" sx={{ p: 2, borderRadius: "12px", borderColor: activeResignation.finalLastWorkingDate ? "primary.main" : "divider" }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                      Final Last Working Date
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: activeResignation.finalLastWorkingDate ? "primary.main" : "text.secondary" }}>
                      {activeResignation.finalLastWorkingDate
                        ? new Date(activeResignation.finalLastWorkingDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                        : "Awaiting Confirmation"}
                    </Typography>
                  </Paper>
                </div>

                {/* Stepper Timeline indicator */}
                <Box sx={{ mt: 4, mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Review Status Progress
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={activeResignation.status === "pending" ? 40 : activeResignation.status === "rejected" ? 100 : 100}
                    color={activeResignation.status === "rejected" ? "error" : "primary"}
                    sx={{ height: 8, borderRadius: 4, mb: 1.5 }}
                  />
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>1. Submitted</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: activeResignation.status === "pending" ? "amber.700" : "text.secondary" }}>2. Under HR Evaluation</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: activeResignation.status !== "pending" ? `${getStatusColor(activeResignation.status)}.main` : "text.secondary" }}>3. Final Concluded</Typography>
                  </Box>
                </Box>

                {/* Remarks Display */}
                {activeResignation.remarks && (
                  <Alert severity={activeResignation.status === "rejected" ? "error" : "success"} sx={{ mt: 3, borderRadius: "10px" }}>
                    <AlertTitle sx={{ fontWeight: 700 }}>HR Reviewer Remarks</AlertTitle>
                    {activeResignation.remarks}
                  </Alert>
                )}

                {/* CASE 2a: APPROVED -> Offer link to Exit Interview questionnaire */}
                {activeResignation.status === "approved" && (
                  <Box
                    id="exit-interview-callout"
                    sx={{
                      mt: 4,
                      p: 3,
                      borderRadius: "14px",
                      bgcolor: "rgba(79, 70, 229, 0.08)",
                      border: "1px dashed rgba(79, 70, 229, 0.25)",
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <ClipboardCheck size={32} className="text-indigo-600 shrink-0" />
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "secondary.main" }}>
                          Exit Interview Questionnaire
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Your resignation is approved. Please fill out the mandatory feedback exit questionnaire.
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      id="go-to-exit-interview-btn"
                      component={Link}
                      to="/exit-interview"
                      variant="contained"
                      color="secondary"
                      size="small"
                      sx={{ borderRadius: "8px", px: 2 }}
                    >
                      Begin Questionnaire
                    </Button>
                  </Box>
                )}

                {/* CASE 2b: REJECTED -> Permit resubmit */}
                {activeResignation.status === "rejected" && (
                  <Button
                    id="re-resign-btn"
                    component={Link}
                    to="/resignation/new"
                    variant="outlined"
                    color="primary"
                    sx={{ mt: 3, borderRadius: "8px" }}
                  >
                    Resubmit Resignation Request
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Help/Summary Column */}
        <div className="col-span-1 flex flex-col gap-6">
          <Card id="resignation-info-card">
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                Company Policy
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                Standard offboarding timelines require a minimum notice period based on your designation. Your country holiday validation operates automatically through the calendar API to verify validity.
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <BadgeAlert size={16} className="text-blue-500" />
                  <Typography variant="caption" color="text.secondary">Weekend dates are restricted</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <BadgeAlert size={16} className="text-blue-500" />
                  <Typography variant="caption" color="text.secondary">Public holidays validation active</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <BadgeAlert size={16} className="text-blue-500" />
                  <Typography variant="caption" color="text.secondary">Support team review: 1-3 business days</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card id="contact-hr-card">
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                Support & Inquiries
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6 }}>
                Need adjustments, extensions, or experiencing difficulty? Our administration team is ready to answer questions.
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                size="small"
                href="mailto:hr@xexit.com"
                sx={{ borderRadius: "8px" }}
              >
                Email HR Team
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Box>
  );
}
