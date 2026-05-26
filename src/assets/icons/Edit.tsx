import React from "react";

export default function Edit(
  props: Readonly<React.SVGProps<SVGSVGElement>>
) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid="icon-edit"
      style={{ WebkitPrintColorAdjust: "exact" }}
      {...props}
    >
      <g clipPath="url(#clip0_edit_icon)">
        <path
          d="M8 2H3.33333C2.97971 2 2.64057 2.14048 2.39052 2.39052C2.14048 2.64057 2 2.97971 2 3.33333V12.6667C2 13.0203 2.14048 13.3594 2.39052 13.6095C2.64057 13.8595 2.97971 14 3.33333 14H12.6667C13.0203 14 13.3594 13.8595 13.6095 13.6095C13.8595 13.3594 14 13.0203 14 12.6667V8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.2504 1.75003C12.5156 1.48481 12.8753 1.33582 13.2504 1.33582C13.6255 1.33582 13.9852 1.48481 14.2504 1.75003C14.5156 2.01525 14.6646 2.37496 14.6646 2.75003C14.6646 3.1251 14.5156 3.48481 14.2504 3.75003L8.24172 9.75936C8.08342 9.91753 7.88786 10.0333 7.67305 10.096L5.75772 10.656C5.70036 10.6728 5.63955 10.6738 5.58166 10.6589C5.52377 10.6441 5.47094 10.614 5.42869 10.5717C5.38643 10.5295 5.35631 10.4766 5.34148 10.4188C5.32665 10.3609 5.32766 10.3001 5.34439 10.2427L5.90439 8.32736C5.96741 8.11273 6.08341 7.9174 6.24172 7.75936L12.2504 1.75003Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      <defs>
        <clipPath id="clip0_edit_icon">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}