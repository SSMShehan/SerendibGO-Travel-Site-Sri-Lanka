import React from 'react';

const Logo = ({ 
  size = 'default', 
  showText = true, 
  className = '',
  variant = 'default' // 'default', 'white', 'dark'
}) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    default: 'w-10 h-10',
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  };

  const textSizeClasses = {
    small: 'text-lg',
    default: 'text-xl',
    large: 'text-2xl',
    xlarge: 'text-3xl'
  };

  const getLogoColors = () => {
    switch (variant) {
      case 'white':
        return {
          stroke: '#ffffff',
          fill: '#ffffff'
        };
      case 'dark':
        return {
          stroke: '#1f2937',
          fill: '#1f2937'
        };
      default:
        return {
          stroke: '#3b82f6',
          fill: '#3b82f6'
        };
    }
  };

  const colors = getLogoColors();

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`${sizeClasses[size]} flex-shrink-0`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main flowing line - abstract profile/river */}
          <path
            d="M15 20 Q25 15 35 25 Q45 35 40 50 Q35 65 25 75 Q15 85 20 95"
            stroke={colors.stroke}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-90"
          />
          
          {/* Upper loop detail */}
          <path
            d="M20 25 Q25 20 30 25 Q25 30 20 25"
            stroke={colors.stroke}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-80"
          />
          
          {/* Wavy pattern - stylized hair/head */}
          <path
            d="M25 30 Q30 25 35 30 Q40 35 35 40 Q30 35 25 30"
            stroke={colors.stroke}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-75"
          />
          
          {/* Teardrop/flame element - solid white */}
          <path
            d="M30 45 Q35 40 40 45 Q35 50 30 45 Z"
            fill={colors.fill}
            className="opacity-90"
          />
          
          {/* Lower flow continuation */}
          <path
            d="M35 55 Q40 60 45 65 Q50 70 55 75"
            stroke={colors.stroke}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-70"
          />
          
          {/* Horizontal extension */}
          <path
            d="M55 75 Q60 80 65 75 Q70 70 75 65"
            stroke={colors.stroke}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-60"
          />
        </svg>
      </div>
      
      {showText && (
        <span className={`ml-3 font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent ${textSizeClasses[size]}`}>
          SerendibGo
        </span>
      )}
    </div>
  );
};

export default Logo;
