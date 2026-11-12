export default function CustomCalendar(
    props: Readonly<React.SVGProps<SVGSVGElement>>
) {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
            {...props}
        >
            <g
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M3.99992 2.66699H11.9999C13.4727 2.66699 14.6666 3.8609 14.6666 5.33366V12.0003C14.6666 13.4731 13.4727 14.667 11.9999 14.667H3.99992C2.52716 14.667 1.33325 13.4731 1.33325 12.0003V5.33366C1.33325 3.8609 2.52716 2.66699 3.99992 2.66699Z" />
                <path d="M5.33325 1.3335V4.00016M10.6666 1.3335V4.00016M1.33325 6.66683H14.6666" />
            </g>
        </svg>
    );
}
