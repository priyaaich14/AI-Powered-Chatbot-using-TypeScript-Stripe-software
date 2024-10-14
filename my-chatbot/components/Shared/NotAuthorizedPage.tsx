import React from 'react';
import { Link } from 'react-router-dom';

const NotAuthorizedPage: React.FC = () => {
  return (
    <div>
      <h2>403 - Not Authorized</h2>
      <p>You do not have permission to view this page.</p>
      <Link to="/">Go back to Home</Link>
    </div>
  );
};

export default NotAuthorizedPage;
