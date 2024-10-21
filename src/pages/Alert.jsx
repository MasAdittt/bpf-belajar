import React from 'react';

const Alert = ({ className, children, ...props }) => {
  return (
    <div className={`border-l-4 p-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

const AlertTitle = ({ children }) => {
  return <h4 className="font-bold mb-1">{children}</h4>;
};

const AlertDescription = ({ children }) => {
  return <p className="text-sm text-gray-600">{children}</p>;
};

export { Alert, AlertTitle, AlertDescription };
