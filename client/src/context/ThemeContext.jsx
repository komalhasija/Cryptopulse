import { createContext, useState } from "react";

export const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(true);

  const toggleTheme = () => setDarkMode(prev => !prev);

  const theme = darkMode
    ? {
        mode: "dark",
        bg: "bg-[#121212]",
        panel: "bg-[#1f1f1f]",
        card: "from-[#1e1e1e] to-[#292929]",
        text: "text-gray-100",
        subtext: "text-gray-400",
        input: "bg-gray-800 text-gray-200 placeholder-gray-400",
        button: "bg-gray-700 hover:bg-gray-600 text-gray-300",
      }
    : {
        mode: "light",
        bg: "bg-gray-400",
        panel: "bg-gray-400",
        card: "from-white to-gray-400",
        text: "text-black",
        subtext: "text-gray-600",
        input: "bg-white text-gray-800 placeholder-gray-500 border border-gray-300",
        button: "bg-gray-100 hover:bg-gray-300 text-gray-800",
      };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
