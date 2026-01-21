export default function Bars(props: Readonly<React.SVGProps<SVGSVGElement>>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            data-testid="icon-bars"
            {...props}
        >
            <rect x="3" y="6" width="18" height="2" rx="1" fillOpacity="0.5" />
            <rect x="5" y="11" width="18" height="2" rx="1" fillOpacity="0.5" />
            <rect x="3" y="16" width="18" height="2" rx="1" fillOpacity="0.5" />
        </svg>
    );
}
