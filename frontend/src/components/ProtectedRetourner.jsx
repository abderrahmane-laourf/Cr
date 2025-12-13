import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ProtectedRetourner = ({ children }) => {
  // In a real implementation, you would check user permissions here
  // For now, we'll just render the children as this is a simplified example
  return <>{children}</>;
};

export default ProtectedRetourner;