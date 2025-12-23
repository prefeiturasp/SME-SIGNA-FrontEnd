import React from "react";

const ArrowLeft: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        width="14"
        height="16"
        viewBox="0 0 14 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M8.049 14.409l-.694.694a.5.5 0 01-.769 0l-6.075-6.072a.5.5 0 010-.486l6.075-6.075a.5.5 0 01.765 0l.694.694a.5.5 0 01-.313.782L4.269 7.25h8.981a.5.5 0 01.5.5v1a.5.5 0 01-.5.5H4.269l3.765 3.587a.5.5 0 01.015.572z"
            fill="#717fc7"
        />
    </svg>
);

export default ArrowLeft;
