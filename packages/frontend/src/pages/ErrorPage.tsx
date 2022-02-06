import { faPrayingHands } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

interface NotFoundProps {
  error: any;
}

const ErrorPage = ({ error }: NotFoundProps) => {
  const logout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="flex h-screen">
      <div className="m-auto text-center">
        <FontAwesomeIcon icon={faPrayingHands} size="2x" />
        <br />
        <h2 className="mt-3">{error.message}</h2>
        {error.response?.data?.message ? (
          <div className="mt-3">{error.response.data.message}</div>
        ) : null}
        <button className="mt-5 praise-button" onClick={logout}>
          Login
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;
