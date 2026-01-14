export default function ArrowCircleDark(
  props: Readonly<React.SVGProps<SVGSVGElement>>
) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      data-testid="icon-arrow-circle"
      {...props}
    >
      <g clipPath="url(#clip0)">
        <mask
          id="mask0"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="16"
          height="16"
          style={{ maskType: "luminance" }}
        >
          <path
            d="M8.00016 14.6667C11.6822 14.6667 14.6668 11.682 14.6668 8.00004C14.6668 4.31804 11.6822 1.33337 8.00016 1.33337C4.31816 1.33337 1.3335 4.31804 1.3335 8.00004C1.3335 11.682 4.31816 14.6667 8.00016 14.6667Z"
            fill="white"
            stroke="white"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M7 11L10 8L7 5"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </mask>

        <g mask="url(#mask0)">
          <path d="M0 0H16V16H0V0Z" fillRule="evenodd"
 />
        </g>
      </g>

      <defs>
        <clipPath id="clip0">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
