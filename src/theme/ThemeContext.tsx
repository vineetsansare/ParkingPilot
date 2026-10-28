import React, { createContext, useContext, useState, useMemo } from "react";
import { useColorScheme, ViewStyle } from "react-native";
import { ThemeColorTokens, lightColors, darkColors } from "./tokens";

export type ThemePreference = "system" | "light" | "dark";
export type DriverPersona = "blue" | "pink";

interface ThemeContextType {
  theme: ThemeColorTokens;
  isDark: boolean;
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
  driverPersona: DriverPersona;
  setDriverPersona: (persona: DriverPersona) => void;
  gradientColors: [string, string];
  personaColor: string;
  personaPastel: string;
  personaBorder: string;
  shadow3D: ViewStyle;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>("system");
  const [driverPersona, setDriverPersona] = useState<DriverPersona>("blue");

  const isDark = useMemo(() => {
    if (preference === "system") {
      return systemColorScheme === "dark";
    }
    return preference === "dark";
  }, [preference, systemColorScheme]);

  const theme = useMemo(() => (isDark ? darkColors : lightColors), [isDark]);

  // Dynamic persona gradient: Sky Blue (Boy) or Rose Pink (Girl) fading to off-white
  const gradientColors = useMemo<[string, string]>(() => {
    if (driverPersona === "pink") {
      return isDark
        ? ["#3B0D28", "#131927"]
        : ["#FCE7F3", "#FDFCFB"];
    }
    return isDark
      ? ["#0C2340", "#131927"]
      : ["#E0F2FE", "#F8FAFC"];
  }, [driverPersona, isDark]);

  const personaColor = useMemo(() => {
    return driverPersona === "pink" ? theme.pinkPrimary : theme.skyPrimary;
  }, [driverPersona, theme]);

  const personaPastel = useMemo(() => {
    return driverPersona === "pink" ? theme.pinkPastel : theme.skyPastel;
  }, [driverPersona, theme]);

  const personaBorder = useMemo(() => {
    return driverPersona === "pink" ? theme.pinkBorder : theme.skyBorder;
  }, [driverPersona, theme]);

  const shadow3D = useMemo<ViewStyle>(() => ({
    shadowColor: isDark ? "#000000" : "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.35 : 0.08,
    shadowRadius: 10,
    elevation: 4,
  }), [isDark]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        preference,
        setPreference,
        driverPersona,
        setDriverPersona,
        gradientColors,
        personaColor,
        personaPastel,
        personaBorder,
        shadow3D,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within a ThemeProvider");
  }
  return context;
};
