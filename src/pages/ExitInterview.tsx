import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  MenuItem,
  Rating,
  Alert,
  CircularProgress,
  useTheme,
  Divider,
  Paper,
} from "@mui/material";
import { ClipboardCheck, Sparkles, Award, Star, ThumbsUp, HelpCircle, ArrowLeft, Send } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store";
import { fetchEmployeeResignations } from "../store/resignationSlice";
import { submitExitResponse, fetchEmployeeExitResponse } from "../store/exitResponseSlice";
import { toast } from "react-hot-toast";

interface ExitFormInputs {
  whyLeaving: string;
  whatLiked: string;
  whatDisliked: string;
  recommendCompany: "yes" | "no" | "maybe";
  suggestions: string;
  overallRating: number;
  additionalFeedback?: string;
}

export default function ExitInterview() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { activeResignation, isLoading: isResignationLoading } = useAppSelector((state) => state.resignation);
  const { activeResponse, isLoading: isResponseLoading } = useAppSelector((state) => state.exitResponse);

  const [hasLoaded, setHasLoaded] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ExitFormInputs>({
    defaultValues: {
      recommendCompany: "maybe",
      overallRating: 5,
    },
  });

  // Initial Data Fetching
  useEffect(() => {
    const loadData = async () => {
      await dispatch(fetchEmployeeResignations());
      setHasLoaded(true);
    };
    loadData();
  }, [dispatch]);

  // Load existing exit response if activeResignation is approved
  useEffect(() => {
    if (activeResignation && activeResignation.status === "approved") {
      dispatch(fetchEmployeeExitResponse(activeResignation.id));
    }
  }, [activeResignation, dispatch]);

  // Sync Form data if response already exists (Read-only view)
  useEffect(() => {
    if (activeResponse) {
      reset({
        whyLeaving: activeResponse.whyLeaving,
        whatLiked: activeResponse.whatLiked,
        whatDisliked: activeResponse.whatDisliked,
        recommendCompany: activeResponse.recommendCompany,
        suggestions: activeResponse.suggestions,
        overallRating: activeResponse.overallRating,
        additionalFeedback: activeResponse.additionalFeedback || "",
      });
    }
  }, [activeResponse, reset]);

  const onSubmit = async (data: ExitFormInputs) => {
    if (!activeResignation) return;

    const payload = {
      resignationId: activeResignation.id,
      ...data,
    };

    const resultAction = await dispatch(submitExitResponse(payload));

    if (submitExitResponse.fulfilled.match(resultAction)) {
      toast.success("Exit interview submitted. Thank you for your feedback!");
      // Refetch response to lock form
      dispatch(fetchEmployeeExitResponse(activeResignation.id));
    } else {
      toast.error((resultAction.payload as string) || "Failed to submit exit interview.");
    }
  };

  const isApproved = activeResignation?.status === "approved";
  const isSubmitted = activeResponse?.isSubmitted || false;

  if (!hasLoaded || isResignationLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  // GATEKEEPER: If no resignation request is approved yet, deny access
  if (!isApproved) {
    return (
      <Box sx={{ maxWidth: 700, mx: "auto", mt: 4, width: "100%" }}>
        <Card id="access-denied-card" sx={{ p: 4, textAlign: "center", border: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2.5 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                bgcolor: "rgba(239, 68, 68, 0.1)",
                color: "error.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ClipboardCheck size={30} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Access Restricted
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, lineHeight: 1.6 }}>
              The formal Exit Interview feedback questionnaire is only accessible to employees whose resignation request has been officially reviewed and **Approved** by the HR Administration team.
            </Typography>

            <Divider sx={{ w: "100%", my: 1 }} />

            <Typography variant="caption" color="text.secondary">
              Current Status: {activeResignation ? `Resignation is "${activeResignation.status}"` : "No Resignation Request Found"}
            </Typography>

            <Button
              id="back-home-btn"
              variant="contained"
              onClick={() => navigate("/dashboard")}
              sx={{ mt: 2, borderRadius: "8px" }}
            >
              Go to Dashboard
            </Button>
          </Box>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 800, mx: "auto", width: "100%" }}>
      {/* Back to Dashboard */}
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Button
          id="back-to-dashboard-btn"
          startIcon={<ArrowLeft size={16} />}
          onClick={() => navigate("/dashboard")}
          sx={{ color: "text.secondary", fontWeight: 600 }}
        >
          Back to Dashboard
        </Button>
      </Box>

      <Box>
        <Typography id="exit-interview-title" variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Exit Interview Questionnaire
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your feedback is highly valued and helps us improve our culture and work environment for current and future team members
        </Typography>
      </Box>

      {isSubmitted && (
        <Alert id="interview-submitted-alert" severity="success" icon={<Award size={20} />} sx={{ borderRadius: "10px" }}>
          You have already submitted your exit feedback response. This form is now in **Read-Only** mode. Thank you for sharing your experience!
        </Alert>
      )}

      <Card id="exit-interview-card">
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          <form id="exit-interview-form" onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
              
              {/* Rating Section */}
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: "14px",
                  bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.01)",
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 3,
                }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Overall Company Experience
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Please rate your overall journey with XEXIT
                  </Typography>
                </Box>
                <Controller
                  name="overallRating"
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { onChange, value } }) => (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Rating
                        id="star-rating"
                        name="overallRating"
                        value={value}
                        onChange={(e, val) => {
                          if (!isSubmitted) onChange(val);
                        }}
                        readOnly={isSubmitted}
                        precision={1}
                        size="large"
                        emptyIcon={<Star size={24} style={{ opacity: 0.3 }} />}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 700, ml: 1, minWidth: 20 }}>
                        {value}/5
                      </Typography>
                    </Box>
                  )}
                />
              </Paper>

              {/* Questionnaire fields */}
              <TextField
                id="exit-whyLeaving"
                label="Why are you leaving the organization?"
                placeholder="Describe your primary motivation for pursuing alternative paths"
                multiline
                rows={3}
                fullWidth
                {...register("whyLeaving", { required: "This question is required" })}
                error={!!errors.whyLeaving}
                helperText={errors.whyLeaving?.message}
                slotProps={{
                  input: {
                    readOnly: isSubmitted,
                  },
                }}
              />

              <TextField
                id="exit-whatLiked"
                label="What did you like most during your tenure?"
                placeholder="Share projects, teams, cultural elements, or benefits you enjoyed"
                multiline
                rows={3}
                fullWidth
                {...register("whatLiked", { required: "This question is required" })}
                error={!!errors.whatLiked}
                helperText={errors.whatLiked?.message}
                slotProps={{
                  input: {
                    readOnly: isSubmitted,
                  },
                }}
              />

              <TextField
                id="exit-whatDisliked"
                label="What did you dislike or feel could be improved?"
                placeholder="Share challenges, bottlenecks, or friction points you encountered"
                multiline
                rows={3}
                fullWidth
                {...register("whatDisliked", { required: "This question is required" })}
                error={!!errors.whatDisliked}
                helperText={errors.whatDisliked?.message}
                slotProps={{
                  input: {
                    readOnly: isSubmitted,
                  },
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <TextField
                    id="exit-recommend"
                    select
                    label="Would you recommend XEXIT to job seekers?"
                    fullWidth
                    {...register("recommendCompany", { required: "This question is required" })}
                    error={!!errors.recommendCompany}
                    helperText={errors.recommendCompany?.message}
                    slotProps={{
                      input: {
                        readOnly: isSubmitted,
                      },
                    }}
                  >
                    <MenuItem value="yes">Yes, definitely</MenuItem>
                    <MenuItem value="maybe">Maybe / Undecided</MenuItem>
                    <MenuItem value="no">No, would not recommend</MenuItem>
                  </TextField>
                </div>

                <div className="flex items-center gap-2 pl-1 h-[56px]">
                  <ThumbsUp size={18} className="text-blue-500" />
                  <Typography variant="caption" color="text.secondary">
                    Your recommendation remains confidential inside Human Resources.
                  </Typography>
                </div>
              </div>

              <TextField
                id="exit-suggestions"
                label="What suggestions do you have for management?"
                placeholder="Operational, tooling, cultural, or managerial suggestions..."
                multiline
                rows={3}
                fullWidth
                {...register("suggestions", { required: "This question is required" })}
                error={!!errors.suggestions}
                helperText={errors.suggestions?.message}
                slotProps={{
                  input: {
                    readOnly: isSubmitted,
                  },
                }}
              />

              <TextField
                id="exit-additionalFeedback"
                label="Any additional feedback or remarks?"
                placeholder="Optional feedback..."
                multiline
                rows={2}
                fullWidth
                {...register("additionalFeedback")}
                slotProps={{
                  input: {
                    readOnly: isSubmitted,
                  },
                }}
              />

              {!isSubmitted && (
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
                  <Button
                    id="cancel-feedback-btn"
                    variant="outlined"
                    onClick={() => navigate("/dashboard")}
                    sx={{ borderRadius: "8px" }}
                  >
                    Cancel
                  </Button>
                  <Button
                    id="submit-feedback-btn"
                    type="submit"
                    variant="contained"
                    color="secondary"
                    disabled={isResponseLoading}
                    startIcon={isResponseLoading ? <CircularProgress size={18} sx={{ color: "white" }} /> : <Send size={16} />}
                    sx={{ py: 1.25, px: 4 }}
                  >
                    Submit Feedback
                  </Button>
                </Box>
              )}
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
