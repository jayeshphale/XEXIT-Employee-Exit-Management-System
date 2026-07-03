import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
  Button,
} from "@mui/material";
import {
  Menu as MenuIcon,
  LogOut,
  User as UserIcon,
  FileText,
  HelpCircle,
  LayoutDashboard,
  ClipboardList,
  Moon,
  Sun,
  Shield,
  HelpCircle as QuestionIcon,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store";
import { logout } from "../../store/authSlice";

const drawerWidth = 260;

interface LayoutProps {
  children: React.ReactNode;
  toggleColorMode: () => void;
  mode: "light" | "dark";
}

export default function Layout({ children, toggleColorMode, mode }: LayoutProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    dispatch(logout());
    navigate("/login");
  };

  // Define sidebar navigation items based on user role
  const isHR = user?.role === "admin";

  const navigationItems = isHR
    ? [
        { text: "HR Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
        { text: "Resignation Requests", path: "/admin/resignations", icon: <ClipboardList size={20} /> },
        { text: "Exit Reviews", path: "/admin/exit-reviews", icon: <FileText size={20} /> },
        { text: "My Profile", path: "/profile", icon: <UserIcon size={20} /> },
      ]
    : [
        { text: "Employee Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
        { text: "Submit Resignation", path: "/resignation/new", icon: <FileText size={20} /> },
        { text: "Exit Interview", path: "/exit-interview", icon: <QuestionIcon size={20} /> },
        { text: "My Profile", path: "/profile", icon: <UserIcon size={20} /> },
      ];

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Brand Header */}
      <Box
        sx={{
          p: 3,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: "white",
        }}
      >
        <Shield size={26} strokeWidth={2.5} />
        <Box>
          <Typography id="brand-title" variant="h5" sx={{ fontWeight: 800, letterSpacing: 1.2 }}>
            XEXIT
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.85, fontSize: "0.65rem", display: "block" }}>
            Exit Management System
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Nav List */}
      <List sx={{ px: 2, py: 3, flexGrow: 1 }}>
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                sx={{
                  borderRadius: "10px",
                  py: 1.25,
                  px: 2,
                  backgroundColor: isActive
                    ? theme.palette.mode === "dark"
                      ? "rgba(59, 130, 246, 0.15)"
                      : "rgba(59, 130, 246, 0.08)"
                    : "transparent",
                  color: isActive ? theme.palette.primary.main : "text.secondary",
                  "&:hover": {
                    backgroundColor: theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.03)"
                      : "rgba(0, 0, 0, 0.02)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? theme.palette.primary.main : "text.secondary",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      sx={{
                        fontWeight: isActive ? 600 : 500,
                        fontSize: "0.9rem",
                      }}
                    >
                      {item.text}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* User Footer Profile */}
      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5, px: 1 }}>
          <Avatar
            id="user-avatar"
            src={user?.profileImage}
            sx={{
              width: 38,
              height: 38,
              border: `2px solid ${theme.palette.primary.main}`,
              bgcolor: theme.palette.primary.main,
            }}
          >
            {user?.firstName ? user.firstName[0].toUpperCase() : "U"}
          </Avatar>
          <Box sx={{ overflow: "hidden" }}>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
              {user ? `${user.firstName} ${user.lastName}` : "User"}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
              {user?.role === "admin" ? "HR Admin" : user?.designation || "Employee"}
            </Typography>
          </Box>
        </Box>
        <Button
          id="logout-btn"
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<LogOut size={16} />}
          onClick={handleLogoutClick}
          sx={{ borderRadius: "8px" }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <CssBaseline />

      {/* AppBar / Top Navbar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, sm: 3 } }}>
          <IconButton
            id="toggle-drawer-btn"
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon size={22} />
          </IconButton>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {user?.role === "admin" && (
              <Typography
                variant="caption"
                sx={{
                  bgcolor: "rgba(79, 70, 229, 0.1)",
                  color: "secondary.main",
                  fontWeight: 700,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: "6px",
                  mr: 1,
                  fontSize: "0.75rem",
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                }}
              >
                HR Admin Console
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ display: { xs: "none", sm: "block" }, fontWeight: 500 }}>
              Welcome back, <strong>{user?.firstName || "Guest"}</strong>
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {/* Quick Status Info */}
            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", md: "block" }, mr: 1, fontWeight: 500 }}>
              Time: {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </Typography>

            {/* Dark/Light mode toggle */}
            <Tooltip title={mode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}>
              <IconButton id="theme-toggle-btn" onClick={toggleColorMode} color="inherit" sx={{ border: `1px solid ${theme.palette.divider}` }}>
                {mode === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </IconButton>
            </Tooltip>

            {/* Avatar Dropdown */}
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="User profile & settings">
                <IconButton id="profile-menu-trigger" onClick={handleMenuOpen} sx={{ p: 0 }}>
                  <Avatar
                    src={user?.profileImage}
                    sx={{
                      width: 36,
                      height: 36,
                      border: `1.5px solid ${theme.palette.primary.main}`,
                      bgcolor: theme.palette.primary.main,
                    }}
                  >
                    {user?.firstName ? user.firstName[0].toUpperCase() : "U"}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                id="profile-menu"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                slotProps={{
                  paper: {
                    sx: {
                      mt: 1.5,
                      p: 0.5,
                      width: 180,
                      boxShadow: "0px 10px 25px rgba(0,0,0,0.1)",
                      borderRadius: "10px",
                    },
                  },
                }}
              >
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    navigate("/profile");
                  }}
                  sx={{ borderRadius: "6px", py: 1 }}
                >
                  <UserIcon size={16} style={{ marginRight: 8 }} />
                  <Typography variant="body2">My Profile</Typography>
                </MenuItem>
                <Divider sx={{ my: 0.5 }} />
                <MenuItem onClick={handleLogoutClick} sx={{ borderRadius: "6px", py: 1, color: "error.main" }}>
                  <LogOut size={16} style={{ marginRight: 8 }} />
                  <Typography variant="body2">Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer containers */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        {/* Mobile View Drawer */}
        <Drawer
          id="mobile-nav-drawer"
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop View Drawer */}
        <Drawer
          id="desktop-nav-drawer"
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.background.paper,
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main App Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2.5, sm: 4 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: "64px", // Topbar clearance height
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
