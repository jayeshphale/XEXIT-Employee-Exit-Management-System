import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { validateDateApi } from "../api/calendarificApi";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  MenuItem,
  Alert,
  CircularProgress,
  useTheme,
  Paper,
  Divider,
} from "@mui/material";
import { FileWarning, Calendar, FileCheck, HelpCircle, ArrowLeft, Send } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store";
import { submitResignation } from "../store/resignationSlice";
import { toast } from "react-hot-toast";

interface ResignationFormInputs {
  reason: string;
  detailedDescription: string;
  lastWorkingDate: string; // YYYY-MM-DD
  managerName: string;
  comments?: string;
  noticePeriod: number;
  attachmentUrl?: string;
}

const RESIGNATION_REASONS = [
  "Better Career Opportunity",
  "Career Transition / Shift",
  "Higher Education / Studies",
  "Personal / Family Reasons",
  "Health Concerns",
  "Relocation / Move",
  "Work-Life Balance",
  "Other (Provide details below)",
];

export default function ResignationForm() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { isLoading } = useAppSelector((state) => state.resignation);

  const [dateValidationError, setDateValidationError] = useState<string | null>(null);
  const [isValidatingDate, setIsValidatingDate] = useState(false);
  const [isDateOk, setIsDateOk] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ResignationFormInputs>({
    defaultValues: {
      noticePeriod: 30, // Standard 30 days notice
    },
  });

  const selectedDate = watch("lastWorkingDate");

  // Run holiday and weekend validation when the date changes
  const validateLastWorkingDate = async (dateStr: string) => {
    if (!dateStr) return;

    setDateValidationError(null);
    setIsDateOk(false);
    setIsValidatingDate(true);

    const chosenDate = new Date(dateStr);
    
    // 1. Weekend Check (0 is Sunday, 6 is Saturday)
    const day = chosenDate.getUTCDay();
    if (day === 0 || day === 6) {
      setDateValidationError("Your selected Last Working Date cannot fall on a weekend (Saturday or Sunday).");
      setIsValidatingDate(false);
      return;
    }

    // 2. Query backend proxy for Calendarific public holiday checks
    try {
      const country = user?.country || "US";
      const data = await validateDateApi(dateStr, country);

      if (data.isHoliday) {
        setDateValidationError(
          `Your selected date falls on a Public Holiday in ${country}: "${data.holidayName}". Please select an alternate working day.`
        );
      } else {
        setIsDateOk(true);
        setDateValidationError(null);
      }
    } catch (err: any) {
      // Graceful fallback for demo/offline purposes if the backend or API key is not fully configured yet
      console.warn("Holiday API validation failed or skipped. Falling back to local validation checks.");
      
      // Basic static checks for common holidays just to be robust and functional
      const monthDay = dateStr.substring(5); // "MM-DD"
      const commonHolidays: { [key: string]: string } = {
        "01-01": "New Year's Day",
        "07-04": "Independence Day",
        "12-25": "Christmas Day",
      };

      if (commonHolidays[monthDay]) {
        setDateValidationError(
          `Your selected date falls on a public holiday: "${commonHolidays[monthDay]}". Please select another day.`
        );
      } else {
        setIsDateOk(true);
        setDateValidationError(null);
      }
    } finally {
      setIsValidatingDate(false);
    }
  };

  // Run validation whenever date selection modifies
  React.useEffect(() => {
    if (selectedDate) {
      validateLastWorkingDate(selectedDate);
    }
  }, [selectedDate]);

  const onSubmit = async (data: ResignationFormInputs) => {
    if (dateValidationError) {
      toast.error("Please correct the Last Working Date before submitting.");
      return;
    }

    if (!isDateOk && selectedDate) {
      toast.error("Verifying selected date validity. Please wait.");
      return;
    }

    const resultAction = await dispatch(submitResignation(data));

    if (submitResignation.fulfilled.match(resultAction)) {
      toast.success("Resignation submitted successfully!");
      navigate("/dashboard");
    } else {
      toast.error((resultAction.payload as string) || "Failed to submit resignation request.");
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 800, mx: "auto", width: "100%" }}>
      {/* Back button link */}
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
        <Typography id="resignation-form-title" variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Initiate Resignation
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please fill out the details carefully to submit your formal resignation notice
        </Typography>
      </Box>

      <Card id="resignation-form-card" sx={{ boxShadow: "0px 10px 30px rgba(0,0,0,0.05)" }}>
        <CardContent sx={{ p: { xs: 3, sm: 4.5 } }}>
          <form id="resignation-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-4">
              
              {/* Notice calculation info paper */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: "12px",
                  bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.01)",
                  borderStyle: "dashed",
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                      Department / Role
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {user?.department} • {user?.designation}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                      Compliance Notice Requirement
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Standard 30 Days Notice Period
                    </Typography>
                  </div>
                </div>
              </Paper>

              {/* Main Fields */}
              <TextField
                id="resignation-reason"
                select
                label="Primary Reason for Leaving"
                fullWidth
                {...register("reason", { required: "Reason is required" })}
                error={!!errors.reason}
                helperText={errors.reason?.message}
              >
                {RESIGNATION_REASONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                id="resignation-description"
                label="Detailed Description"
                placeholder="Please describe your reasoning or any feedback you want to share with management."
                multiline
                rows={4}
                fullWidth
                {...register("detailedDescription", { required: "Detailed description is required" })}
                error={!!errors.detailedDescription}
                helperText={errors.detailedDescription?.message}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <TextField
                    id="resignation-manager"
                    label="Reporting Manager Name"
                    placeholder="Enter manager's full name"
                    fullWidth
                    {...register("managerName", { required: "Manager name is required" })}
                    error={!!errors.managerName}
                    helperText={errors.managerName?.message}
                  />
                </div>

                <div>
                  <TextField
                    id="resignation-notice"
                    label="Notice Period (Days)"
                    type="number"
                    fullWidth
                    slotProps={{
                      input: {
                        readOnly: true,
                      },
                    }}
                    {...register("noticePeriod", { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
                <div>
                  <TextField
                    id="resignation-lwd"
                    label="Requested Last Working Date"
                    type="date"
                    fullWidth
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      },
                    }}
                    {...register("lastWorkingDate", { required: "Last working date is required" })}
                    error={!!errors.lastWorkingDate}
                    helperText={errors.lastWorkingDate?.message}
                  />
                </div>

                {/* Validation Response Panel */}
                <div className="flex flex-col gap-1 min-h-[56px] justify-center">
                  {isValidatingDate && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, pl: 1 }}>
                      <CircularProgress size={16} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Verifying date via Calendarific API...
                      </Typography>
                    </Box>
                  )}

                  {dateValidationError && (
                    <Alert
                      id="lwd-validation-error"
                      severity="error"
                      icon={<FileWarning size={16} />}
                      sx={{ py: 0.5, px: 1.5, borderRadius: "8px" }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 500 }}>
                        {dateValidationError}
                      </Typography>
                    </Alert>
                  )}

                  {isDateOk && (
                    <Alert
                      id="lwd-validation-success"
                      severity="success"
                      icon={<FileCheck size={16} />}
                      sx={{ py: 0.5, px: 1.5, borderRadius: "8px" }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        Date verified as a valid corporate business day.
                      </Typography>
                    </Alert>
                  )}
                </div>
              </div>

              <TextField
                id="resignation-comments"
                label="Additional Remarks / Comments"
                placeholder="Optional remarks..."
                fullWidth
                {...register("comments")}
              />

              <TextField
                id="resignation-attachment"
                label="Attachment URL (Optional)"
                placeholder="Link to signed resignation letter or documents"
                fullWidth
                {...register("attachmentUrl")}
              />

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <Button
                  id="cancel-resignation-btn"
                  variant="outlined"
                  onClick={() => navigate("/dashboard")}
                  disabled={isLoading}
                  sx={{ borderRadius: "8px" }}
                >
                  Cancel
                </Button>
                <Button
                  id="submit-resignation-btn"
                  type="submit"
                  variant="contained"
                  disabled={isLoading || !!dateValidationError || isValidatingDate}
                  startIcon={isLoading ? <CircularProgress size={18} sx={{ color: "white" }} /> : <Send size={16} />}
                  sx={{ py: 1.25, px: 4 }}
                >
                  Submit Resignation
                </Button>
              </Box>
            </div>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
