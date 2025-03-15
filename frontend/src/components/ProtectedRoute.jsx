import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ element }) => {
  const [isTokenValid, setIsTokenValid] = useState(null);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await fetch("http://localhost:8080/auth/validate_token", {
          method: "GET",
          credentials: "include",
        });

        setIsTokenValid(response.ok);
      } catch (error) {
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
