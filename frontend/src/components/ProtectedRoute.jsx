import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../Api.js";

const ProtectedRoute = ({ element }) => {
  const [isTokenValid, setIsTokenValid] = useState(null);

  useEffect(() => {
    const get_me = async () => {
      try {
        const response = await api.auth.dashboard();
        setIsTokenValid(response.status == 200);
      } catch (error) {
        console.error(error);
        setIsTokenValid(false);
      }
    };

    get_me();
  }, []);

  if (isTokenValid === null) {
    return <div>Loading...</div>;
  }

  return isTokenValid ? element : <Navigate to="/login" />;
};

export default ProtectedRoute;