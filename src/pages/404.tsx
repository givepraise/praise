import { faPrayingHands } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

const NotFound = () => {
  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="flex h-screen">
      <div className="m-auto text-center">
        <FontAwesomeIcon icon={faPrayingHands} size="2x" />
        <br />
        <h2 className="mt-3">Not found</h2>
        <button className="mt-5 praise-button" onClick={logout}>
          Login
        </button>
      </div>
    </div>
  );
};

export default NotFound;
