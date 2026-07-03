import { createTheme, ThemeOptions } from "@mui/material/styles";

// Primary palette highlights for the professional corporate exit system
const primaryColors = {
  main: "#3b82f6", // Vibrant modern blue
  light: "#60a5fa",
  dark: "#1d4ed8",
  contrastText: "#ffffff",
};

const secondaryColors = {
  main: "#4f46e5", // Deep royal indigo
  light: "#818cf8",
  dark: "#3730a3",
  contrastText: "#ffffff",
};

export const getThemeOptions = (mode: "light" | "dark"): ThemeOptions => {
  const isDark = mode === "dark";

  return {
    palette: {
      mode,
      primary: primaryColors,
      secondary: secondaryColors,
      background: {
        default: isDark ? "#0b0f19" : "#f8fafc", // Very soft sleek gray or tech deep navy
        paper: isDark ? "#111827" : "#ffffff",
      },
      text: {
        primary: isDark ? "#f3f4f6" : "#0f172a",
        secondary: isDark ? "#9ca3af" : "#475569",
      },
      divider: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)",
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        letterSpacing: "-0.025em",
      },
      h2: {
        fontWeight: 700,
        letterSpacing: "-0.02em",
      },
      h3: {
        fontWeight: 600,
        letterSpacing: "-0.02em",
      },
      h4: {
        fontWeight: 600,
        letterSpacing: "-0.015em",
      },
      h5: {
        fontWeight: 600,
        letterSpacing: "-0.01em",
      },
      h6: {
        fontWeight: 600,
        letterSpacing: "-0.01em",
      },
      button: {
        textTransform: "none", // Avoid robotic uppercase buttons
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 12, // Modern rounded interfaces
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: "10px",
            padding: "8px 18px",
            fontWeight: 600,
            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "none",
            "&:hover": {
              boxShadow: "0px 4px 12px rgba(59, 130, 246, 0.15)",
              transform: "translateY(-1px)",
            },
            "&:active": {
              transform: "translateY(0px)",
            },
            "&.MuiButton-containedPrimary": {
              background: `linear-gradient(135deg, ${primaryColors.main} 0%, ${secondaryColors.main} 100%)`,
              border: "0px",
              "&:hover": {
                background: `linear-gradient(135deg, ${primaryColors.dark} 0%, ${secondaryColors.dark} 100%)`,
              },
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: "16px",
            backgroundImage: "none",
            boxShadow: isDark
              ? "0 4px 20px 0 rgba(0, 0, 0, 0.3)"
              : "0 4px 20px 0 rgba(148, 163, 184, 0.08)",
            border: isDark
              ? "1px solid rgba(255, 255, 255, 0.05)"
              : "1px solid rgba(15, 23, 42, 0.05)",
            backdropFilter: "blur(8px)", // Frosted glass foundation
            backgroundColor: isDark ? "rgba(17, 24, 39, 0.85)" : "rgba(255, 255, 255, 0.9)",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: "none",
            borderBottom: isDark
              ? "1px solid rgba(255, 255, 255, 0.08)"
              : "1px solid rgba(15, 23, 42, 0.08)",
            backdropFilter: "blur(12px)",
            backgroundColor: isDark ? "rgba(11, 15, 25, 0.8)" : "rgba(255, 255, 255, 0.8)",
            color: isDark ? "#f3f4f6" : "#0f172a",
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              transition: "all 0.2s ease",
              "& fieldset": {
                borderColor: isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(15, 23, 42, 0.15)",
              },
              "&:hover fieldset": {
                borderColor: primaryColors.main,
              },
              "&.Mui-focused fieldset": {
                borderWidth: "1.5px",
              },
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: "18px",
            backgroundImage: "none",
            boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.25)",
          },
        },
      },
    },
  };
};

export const lightTheme = createTheme(getThemeOptions("light"));
export const darkTheme = createTheme(getThemeOptions("dark"));
