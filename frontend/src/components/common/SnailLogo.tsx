import React from 'react';

interface SnailLogoProps {
  className?: string;
  size?: number;
}

export const SnailLogo: React.FC<SnailLogoProps> = ({ className = 'w-24 h-24', size = 96 }) => {
  return (
    <div className={`relative inline-block ${className} flex items-center justify-center`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-[0_8px_16px_rgba(245,158,11,0.25)]"
      >
        {/* Snail Foot / Body Base (Tan/Greyish Yellow) */}
        <path
          d="M20 90C20 90 28 98 48 98C68 98 96 95 106 88C110 85 108 78 102 78C95 78 88 80 80 80C75 80 70 78 68 74C65 68 62 60 56 58C50 56 46 62 44 68C40 78 30 84 20 90Z"
          fill="#D8D4C8"
          stroke="#5C5549"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Tail tip */}
        <path
          d="M106 88C112 87 116 83 114 79C112 77 106 77 102 78"
          fill="#D8D4C8"
          stroke="#5C5549"
          strokeWidth="3"
        />

        {/* Neck & Head */}
        <path
          d="M32 86C32 86 36 72 38 60C40 48 44 44 50 44C58 44 60 52 58 64C56 74 50 82 46 88"
          fill="#D8D4C8"
          stroke="#5C5549"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Shell (Orange Spiral Shell) */}
        <circle
          cx="68"
          cy="68"
          r="26"
          fill="#F59E0B"
          stroke="#78350F"
          strokeWidth="3.5"
        />
        <path
          d="M68 44C81.2548 44 92 54.7452 92 68C92 81.2548 81.2548 92 68 92C54.7452 92 44 81.2548 44 68C44 58 52 48 64 48C74 48 82 56 82 66C82 74 76 80 68 80C62 80 56 75 56 68C56 63 60 59 65 59C69 59 72 62 72 66"
          stroke="#78350F"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        {/* Shell Highlights / Ridge segments */}
        <path d="M50 56C54 50 62 46 68 45" stroke="#FDE68A" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M84 56C89 62 90 70 89 76" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />

        {/* Snail Eyestalks (Tentacles) */}
        {/* Left Eyestalk */}
        <path
          d="M44 46C42 34 38 24 36 18"
          stroke="#5C5549"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx="35" cy="16" r="4.5" fill="#F59E0B" stroke="#78350F" strokeWidth="2.5" />

        {/* Right Eyestalk */}
        <path
          d="M52 46C56 34 60 24 64 18"
          stroke="#5C5549"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx="65" cy="16" r="4.5" fill="#F59E0B" stroke="#78350F" strokeWidth="2.5" />

        {/* Big Cartoon Eyes on Snail Face */}
        {/* Left Eye */}
        <circle cx="44" cy="40" r="7" fill="white" stroke="#5C5549" strokeWidth="2.5" />
        <circle cx="45" cy="39" r="3.5" fill="#1E293B" />
        <circle cx="46.5" cy="37.5" r="1.2" fill="white" />

        {/* Right Eye */}
        <circle cx="56" cy="40" r="7" fill="white" stroke="#5C5549" strokeWidth="2.5" />
        <circle cx="57" cy="39" r="3.5" fill="#1E293B" />
        <circle cx="58.5" cy="37.5" r="1.2" fill="white" />

        {/* Cute Smile / Mouth */}
        <path
          d="M47 52C49 55 53 55 55 52"
          stroke="#5C5549"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Rosy Cheeks */}
        <circle cx="40" cy="48" r="2.5" fill="#F87171" opacity="0.6" />
        <circle cx="61" cy="48" r="2.5" fill="#F87171" opacity="0.6" />
      </svg>
    </div>
  );
};
