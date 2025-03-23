import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../Api.js";

const ProtectedRoute = ({ element }) => {
  const [isTokenValid, setIsTokenValid] = useState(null);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await api.auth.validateToken();
        setIsTokenValid(response.status == 200);
      } catch (error) {
        console.error(error);
        setIsTokenValid(false);
      }
    };

    validateToken();
  }, []);

  if (isTokenValid === null) {
    return <div>Loading...</div>;
  }

  return isTokenValid ? element : <Navigate to="/login" />;
};

export default ProtectedRoute;
