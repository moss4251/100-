import React from 'react';

interface RopeGraphicProps {
  className?: string;
  isDragging?: boolean;
  highlighted?: boolean;
}

export const RopeGraphic: React.FC<RopeGraphicProps> = ({
  className = '',
  isDragging = false,
  highlighted = false,
}) => {
  return (
    <div
      className={`relative select-none flex flex-col items-center justify-center cursor-grab active:cursor-grabbing transition-transform ${
        isDragging ? 'scale-102 shadow-xl' : 'hover:scale-[1.01]'
      } ${highlighted ? 'ring-2 ring-red-500 rounded-lg' : ''} ${className}`}
      style={{ width: '270px', height: '36px' }}
      title="已解开并展开在木棒下方的捆绳"
    >
      {/* Horizontally unfolded long rope / ribbon lying flat under the 10 wooden sticks */}
      <svg
        width="270"
        height="32"
        viewBox="0 0 270 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-sm w-full h-full overflow-visible"
      >
        {/* Left frayed ribbon end */}
        <path
          d="M 12 24 C 6 22, 2 16, 8 10 C 14 14, 22 18, 30 16"
          stroke="#b91c1c"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M 16 26 C 22 20, 26 16, 32 16"
          stroke="#dc2626"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Main horizontal ribbon band that spanned across the 10 sticks */}
        <path
          d="M 28 16 Q 70 19, 135 15 Q 200 11, 242 16"
          stroke="#991b1b"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M 28 16 Q 70 19, 135 15 Q 200 11, 242 16"
          stroke="#ef4444"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Golden woven stitch thread details */}
        <path
          d="M 32 16 Q 70 19, 135 15 Q 200 11, 238 16"
          stroke="#fde047"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeDasharray="4 3"
        />

        {/* Center untied bowknot and loop */}
        <ellipse cx="135" cy="15" rx="8" ry="6" fill="#dc2626" stroke="#fbbf24" strokeWidth="1.5" />
        {/* Untied loop ribbons */}
        <path
          d="M 132 13 C 120 4, 110 8, 122 18 C 126 21, 131 17, 135 15"
          stroke="#b91c1c"
          strokeWidth="2.5"
          fill="#f87171"
          fillOpacity="0.4"
        />
        <path
          d="M 138 13 C 150 4, 160 8, 148 18 C 144 21, 139 17, 135 15"
          stroke="#b91c1c"
          strokeWidth="2.5"
          fill="#f87171"
          fillOpacity="0.4"
        />

        {/* Right loose cord end */}
        <path
          d="M 240 16 C 248 18, 256 14, 262 20 C 266 24, 260 28, 254 26"
          stroke="#b91c1c"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M 242 16 C 248 20, 252 24, 258 24"
          stroke="#dc2626"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {/* Label under the rope */}
      <div className="absolute -bottom-2 px-2 py-0.2 bg-red-100/90 text-red-800 text-[10px] font-bold rounded-full border border-red-300 shadow-2xs pointer-events-none flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
        <span>已展开的捆绳（原固定10根小棒）</span>
      </div>
    </div>
  );
};
