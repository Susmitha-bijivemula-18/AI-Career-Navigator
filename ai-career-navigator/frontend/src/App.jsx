import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router/AppRouter';
import Navbar from './components/layout/Navbar';
import { useTheme } from './hooks/useTheme';

function ThemeProvider({ children }) {
  // useTheme already runs a useEffect to set the dark mode class based on state/localStorage
  useTheme();
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
          <Navbar />
          <AppRouter />
        </div>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
