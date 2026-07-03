import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  IconButton,
  Rating,
  useTheme,
  TablePagination,
} from "@mui/material";
import {
  Users,
  FileCheck2,
  AlertCircle,
  FileSpreadsheet,
  Search,
  Filter,
  Check,
  X,
  ExternalLink,
  Calendar,
  Sparkles,
  Download,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store";
import { fetchAllResignations, concludeResignation } from "../store/resignationSlice";
import { fetchAllExitResponses } from "../store/exitResponseSlice";
import { toast } from "react-hot-toast";
import { Resignation, ExitResponse } from "../types";

export default function AdminDashboard() {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const { resignations, isLoading: isResignationsLoading } = useAppSelector((state) => state.resignation);
  const { exitResponses, isLoading: isResponsesLoading } = useAppSelector((state) => state.exitResponse);

  const [activeTab, setActiveTab] = useState(0);

  // Filters & Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");

  // Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Conclude Action Dialog State
  const [selectedResignation, setSelectedResignation] = useState<Resignation | null>(null);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [adminRemarks, setAdminRemarks] = useState("");
  const [modifiedLwd, setModifiedLwd] = useState("");
  const [dateValidationWarning, setDateValidationWarning] = useState<string | null>(null);
  const [isValidatingDate, setIsValidatingDate] = useState(false);
  const [isSubmittingConclusion, setIsSubmittingConclusion] = useState(false);

  // Load Data
  useEffect(() => {
    dispatch(fetchAllResignations({}));
    dispatch(fetchAllExitResponses({}));
  }, [dispatch]);

  // Handle Tab Switch
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setSearchTerm("");
    setPage(0);
  };

  // Run holiday and weekend validation for Modified LWD
  const handleModifiedLwdChange = async (dateStr: string) => {
    setModifiedLwd(dateStr);
    if (!dateStr || !selectedResignation) {
      setDateValidationWarning(null);
      return;
    }

    setDateValidationWarning(null);
    setIsValidatingDate(true);

    const chosenDate = new Date(dateStr);
    const day = chosenDate.getUTCDay();

    // 1. Weekend Check
    if (day === 0 || day === 6) {
      setDateValidationWarning("Modified Last Working Date cannot fall on a weekend (Saturday or Sunday).");
      setIsValidatingDate(false);
      return;
    }

    // 2. Query Calendarific public holiday check proxy
    try {
      const country = selectedResignation.employeeId ? "US" : "US"; // Standard fallback country
      const response = await axios.get("/api/calendarific/validate-date", {
        params: {
          date: dateStr,
          country,
        },
      });

      if (response.data.isHoliday) {
        setDateValidationWarning(
          `Selected date falls on a Public Holiday: "${response.data.holidayName}". Please choose a standard working day.`
        );
      }
    } catch (err) {
      // Local backup checks
      const monthDay = dateStr.substring(5); // "MM-DD"
      const backupHolidays: { [key: string]: string } = {
        "01-01": "New Year's Day",
        "07-04": "Independence Day",
        "12-25": "Christmas Day",
      };
      if (backupHolidays[monthDay]) {
        setDateValidationWarning(
          `Selected date falls on a public holiday: "${backupHolidays[monthDay]}".`
        );
      }
    } finally {
      setIsValidatingDate(false);
    }
  };

  const handleOpenActionDialog = (resignation: Resignation) => {
    setSelectedResignation(resignation);
    setAdminRemarks("");
    setModifiedLwd(resignation.lastWorkingDate);
    setDateValidationWarning(null);
    setIsActionOpen(true);
  };

  const handleCloseActionDialog = () => {
    setIsActionOpen(false);
    setSelectedResignation(null);
  };

  const handleConcludeAction = async (actionType: "approve" | "reject") => {
    if (!selectedResignation) return;

    if (actionType === "reject" && !adminRemarks.trim()) {
      toast.error("Please provide remarks/reason for rejection.");
      return;
    }

    if (actionType === "approve" && dateValidationWarning) {
      toast.error("Please correct the Last Working Date before approving.");
      return;
    }

    setIsSubmittingConclusion(true);

    const resultAction = await dispatch(
      concludeResignation({
        resignationId: selectedResignation.id,
        action: actionType,
        remarks: adminRemarks.trim(),
        finalLastWorkingDate: modifiedLwd || undefined,
      })
    );

    setIsSubmittingConclusion(false);

    if (concludeResignation.fulfilled.match(resultAction)) {
      toast.success(`Resignation successfully ${actionType}d!`);
      handleCloseActionDialog();
      dispatch(fetchAllResignations({}));
    } else {
      toast.error((resultAction.payload as string) || "Failed to submit decision.");
    }
  };

  // Exporters
  const handleExportJSON = () => {
    if (exitResponses.length === 0) {
      toast.error("No exit responses found to export.");
      return;
    }

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(exitResponses, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `XEXIT_Exit_Responses_${new Date().toISOString().substring(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("JSON feedback database exported successfully!");
  };

  // Safe array fallbacks to prevent crashes if states are temporarily non-array types
  const safeResignations = Array.isArray(resignations) ? resignations : [];
  const safeExitResponses = Array.isArray(exitResponses) ? exitResponses : [];

  // Resignation calculations
  const totalRequests = safeResignations.length;
  const pendingRequestsCount = safeResignations.filter((r) => r.status === "pending").length;
  const approvedRequestsCount = safeResignations.filter((r) => r.status === "approved").length;
  const rejectedRequestsCount = safeResignations.filter((r) => r.status === "rejected").length;

  const avgExitRating =
    safeExitResponses.length > 0
      ? (safeExitResponses.reduce((acc, curr) => acc + curr.overallRating, 0) / safeExitResponses.length).toFixed(1)
      : "N/A";

  // Filter & Search Logics
  const filteredResignations = safeResignations.filter((r) => {
    const matchesSearch =
      (r.employeeName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.reason || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.employeeEmail || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const filteredExitResponses = safeExitResponses.filter((res) => {
    return (
      (res.employeeName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (res.whyLeaving || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Pagination bounds
  const paginatedResignations = filteredResignations.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const paginatedExitResponses = filteredExitResponses.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* Page Title */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography id="admin-title" variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            HR Administration Console
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Oversee corporate resignations, modify transition schedules, and audit exit feedback insights
          </Typography>
        </Box>
        {activeTab === 1 && (
          <Button
            id="export-json-btn"
            variant="contained"
            color="secondary"
            startIcon={<Download size={16} />}
            onClick={handleExportJSON}
            sx={{ borderRadius: "8px" }}
          >
            Export Responses JSON
          </Button>
        )}
      </Box>

      {/* KPI Stats Overview Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card id="kpi-total">
          <CardContent sx={{ display: "flex", alignItems: "center", gap: 2.5, p: 2.5 }}>
            <Box sx={{ p: 1.5, borderRadius: "10px", bgcolor: "rgba(59, 130, 246, 0.12)", color: "primary.main" }}>
              <Users size={22} />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Total Requests
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {totalRequests}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card id="kpi-pending">
          <CardContent sx={{ display: "flex", alignItems: "center", gap: 2.5, p: 2.5 }}>
            <Box sx={{ p: 1.5, borderRadius: "10px", bgcolor: "rgba(245, 158, 11, 0.12)", color: "amber.700" }}>
              <AlertCircle size={22} />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Pending Review
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "amber.700" }}>
                {pendingRequestsCount}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card id="kpi-approved">
          <CardContent sx={{ display: "flex", alignItems: "center", gap: 2.5, p: 2.5 }}>
            <Box sx={{ p: 1.5, borderRadius: "10px", bgcolor: "rgba(16, 185, 129, 0.12)", color: "success.main" }}>
              <FileCheck2 size={22} />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Approved Exits
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "success.main" }}>
                {approvedRequestsCount}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card id="kpi-survey">
          <CardContent sx={{ display: "flex", alignItems: "center", gap: 2.5, p: 2.5 }}>
            <Box sx={{ p: 1.5, borderRadius: "10px", bgcolor: "rgba(79, 70, 229, 0.12)", color: "secondary.main" }}>
              <FileSpreadsheet size={22} />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Avg Exit Rating
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "secondary.main" }}>
                {avgExitRating} <span className="text-sm text-gray-400">/ 5</span>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Segment */}
      <Card id="admin-tabs-card" sx={{ overflow: "hidden" }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            "& .MuiTab-root": { py: 2, fontWeight: 700 },
          }}
        >
          <Tab label="Resignation Database" />
          <Tab label="Exit Questionnaire Reviews" />
        </Tabs>

        {/* Filter Toolbar */}
        <Box sx={{ p: 3, display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center", borderBottom: `1px solid ${theme.palette.divider}` }}>
          <TextField
            id="search-input"
            placeholder={activeTab === 0 ? "Search employee, email, or reason..." : "Search feedback..."}
            size="small"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            slotProps={{
              input: {
                startAdornment: <Search size={16} className="text-gray-400 mr-2" />,
              },
            }}
            sx={{ flexGrow: 1, maxWidth: { xs: "100%", sm: 300 } }}
          />

          {activeTab === 0 && (
            <TextField
              id="status-filter"
              select
              label="Status"
              size="small"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="pending">Pending Review</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </TextField>
          )}
        </Box>

        {/* Tab 0 Content: Resignations Table */}
        {activeTab === 0 && (
          <Box sx={{ p: 0 }}>
            <TableContainer>
              <Table id="resignations-table">
                <TableHead sx={{ bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.01)" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Employee Details</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Notice Period</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Submission Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Selected LWD</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Final LWD</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isResignationsLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : filteredResignations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary" variant="body2">No resignation records match your filter criteria.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedResignations.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.employeeName}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>{item.employeeEmail}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={`${item.noticePeriod} Days`} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{new Date(item.createdAt).toLocaleDateString()}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{new Date(item.lastWorkingDate).toLocaleDateString()}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: item.finalLastWorkingDate ? "primary.main" : "text.secondary" }}>
                            {item.finalLastWorkingDate ? new Date(item.finalLastWorkingDate).toLocaleDateString() : "Pending review"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.status.toUpperCase()}
                            color={item.status === "approved" ? "success" : item.status === "rejected" ? "error" : "warning"}
                            size="small"
                            sx={{ fontWeight: 700, borderRadius: "6px" }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {item.status === "pending" ? (
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<Sparkles size={14} />}
                              onClick={() => handleOpenActionDialog(item)}
                              sx={{ borderRadius: "6px" }}
                            >
                              Review & Action
                            </Button>
                          ) : (
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Reviewed</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filteredResignations.length}
              page={page}
              onPageChange={(e, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </Box>
        )}

        {/* Tab 1 Content: Exit Reviews Table */}
        {activeTab === 1 && (
          <Box sx={{ p: 0 }}>
            <TableContainer>
              <Table id="exit-responses-table">
                <TableHead sx={{ bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.01)" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Why Leaving</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>What Liked</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Recommend</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Overall Rating</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Submitted Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isResponsesLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : filteredExitResponses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary" variant="body2">No exit interview responses submitted yet.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedExitResponses.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.employeeName}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>{item.employeeEmail}</Typography>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }}>
                          <Typography variant="body2" noWrap>{item.whyLeaving}</Typography>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }}>
                          <Typography variant="body2" noWrap>{item.whatLiked}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.recommendCompany.toUpperCase()}
                            color={item.recommendCompany === "yes" ? "success" : item.recommendCompany === "no" ? "error" : "default"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Rating value={item.overallRating} readOnly size="small" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{new Date(item.createdAt).toLocaleDateString()}</Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filteredExitResponses.length}
              page={page}
              onPageChange={(e, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </Box>
        )}
      </Card>

      {/* Decision Panel Modal Dialog */}
      <Dialog
        id="conclude-dialog"
        open={isActionOpen}
        onClose={handleCloseActionDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800, py: 2.5, px: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
          Conclude Resignation: {selectedResignation?.employeeName}
        </DialogTitle>
        <DialogContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
          
          {/* Employee Resignation metadata review */}
          <Paper variant="outlined" sx={{ p: 2, borderRadius: "10px", bgcolor: "rgba(0,0,0,0.01)" }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>Reason for Resigning</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5 }}>{selectedResignation?.reason}</Typography>
            
            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>Detailed Explanation</Typography>
            <Typography variant="body2" sx={{ mb: 1.5 }}>{selectedResignation?.detailedDescription}</Typography>

            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>Original Last Working Date</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {selectedResignation?.lastWorkingDate ? new Date(selectedResignation.lastWorkingDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ""}
            </Typography>
          </Paper>

          {/* Action configuration fields */}
          <TextField
            id="admin-remarks-input"
            label="Remarks / Rejection or Approval Reason"
            placeholder="Provide official feedback remarks for employee notifications..."
            multiline
            rows={3}
            fullWidth
            required
            value={adminRemarks}
            onChange={(e) => setAdminRemarks(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <TextField
              id="modify-lwd-input"
              label="Modify Final Last Working Date"
              type="date"
              fullWidth
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              value={modifiedLwd}
              onChange={(e) => handleModifiedLwdChange(e.target.value)}
            />

            {/* In-Modal validation panel */}
            <Box>
              {isValidatingDate && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={14} />
                  <Typography variant="caption" color="text.secondary">Verifying date...</Typography>
                </Box>
              )}
              {dateValidationWarning && (
                <Alert severity="error" icon={<AlertCircle size={14} />} sx={{ py: 0.5, px: 1, borderRadius: "6px" }}>
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>{dateValidationWarning}</Typography>
                </Alert>
              )}
            </Box>
          </div>

        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2.5, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button onClick={handleCloseActionDialog} disabled={isSubmittingConclusion} sx={{ borderRadius: "8px" }}>
            Cancel
          </Button>
          <Button
            id="admin-reject-btn"
            variant="outlined"
            color="error"
            startIcon={<X size={16} />}
            onClick={() => handleConcludeAction("reject")}
            disabled={isSubmittingConclusion || !adminRemarks.trim()}
            sx={{ borderRadius: "8px" }}
          >
            Reject Request
          </Button>
          <Button
            id="admin-approve-btn"
            variant="contained"
            color="success"
            startIcon={<Check size={16} />}
            onClick={() => handleConcludeAction("approve")}
            disabled={isSubmittingConclusion || !!dateValidationWarning || isValidatingDate}
            sx={{ borderRadius: "8px", color: "white" }}
          >
            Approve Exit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
