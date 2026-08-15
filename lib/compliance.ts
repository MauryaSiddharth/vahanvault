export const getComplianceStatus = (expiryDate: Date | string): 'valid' | 'expiring_soon' | 'expired' => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return 'expired';
  } else if (diffDays <= 15) {
    return 'expiring_soon';
  } else {
    return 'valid';
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'valid': return 'text-green-600';
    case 'expiring_soon': return 'text-yellow-600';
    case 'expired': return 'text-red-600';
    default: return 'text-gray-600';
  }
};

export const getStatusBgColor = (status: string): string => {
  switch (status) {
    case 'valid': return 'bg-green-100';
    case 'expiring_soon': return 'bg-yellow-100';
    case 'expired': return 'bg-red-100';
    default: return 'bg-gray-100';
  }
};

export const getStatusEmoji = (status: string): string => {
  switch (status) {
    case 'valid': return '✅';
    case 'expiring_soon': return '⚠️';
    case 'expired': return '❌';
    default: return '❓';
  }
};
