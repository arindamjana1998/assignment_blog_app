import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./routes/AppRouter";

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3500,
            style: {
              background: "#0f172a",
              color: "#f8fafc",
              fontSize: "13px",
              borderRadius: "10px",
              border: "1px solid #1e293b",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#ffffff",
              },
            },
            error: {
              iconTheme: {
                primary: "#f43f5e",
                secondary: "#ffffff",
              },
            },
          }}
        />
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
