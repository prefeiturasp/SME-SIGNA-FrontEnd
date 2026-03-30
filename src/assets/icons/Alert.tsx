export default function Filter(
    props: Readonly<React.SVGProps<SVGSVGElement>>
  ) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        {...props}
      >
        <path
          d="M3.54157 4.67467C5.2249 6.83301 8.33324 10.833 8.33324 10.833V15.833C8.33324 16.2913 8.70824 16.6663 9.16657 16.6663H10.8332C11.2916 16.6663 11.6666 16.2913 11.6666 15.833V10.833C11.6666 10.833 14.7666 6.83301 16.4499 4.67467C16.8749 4.12467 16.4832 3.33301 15.7916 3.33301H4.1999C3.50824 3.33301 3.11657 4.12467 3.54157 4.67467Z"
          fill="currentColor"
        />
      </svg>
    );
  }