import React from 'react';

interface BackButtonProps {
  href?: string;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ 
  href, 
  className = "fixed top-20 left-6 z-50 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-200 flex items-center space-x-2" 
}) => {
  const handleBack = () => {
    if (href) {
      window.location.href = href;
    } else {
      window.history.back();
    }
  };

  return (
    <button
      onClick={handleBack}
      className={className}
      aria-label="Go back"
    >
      <svg 
        className="w-5 h-5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M15 19l-7-7 7-7" 
        />
      </svg>
      <span className="hidden sm:inline">Back</span>
    </button>
  );
};

export default BackButton; 