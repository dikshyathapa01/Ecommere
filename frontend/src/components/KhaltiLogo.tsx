// Khalti brand logo SVG inline component
export default function KhaltiLogo({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block"
    >
      <rect width="48" height="48" rx="8" fill="white" />
      <text
        x="24"
        y="32"
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
        fontSize="14"
        fill="#5C2D91"
        textAnchor="middle"
      >
        K
      </text>
      <circle cx="24" cy="24" r="20" stroke="#5C2D91" strokeWidth="2.5" fill="none" />
    </svg>
  )
}
