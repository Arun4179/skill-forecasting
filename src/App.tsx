import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Assessment from "./pages/Assesment";
import Settings from "./pages/Settings";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./pages/Register";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />}/>

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
              <Assessment />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
              <Settings />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
