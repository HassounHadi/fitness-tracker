import Link from "next/link";

export const Logo = () => (
  <Link href={"/"}>
    <div className="flex items-center gap-2">
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2 16 L8 16 L10 12 L14 20 L18 10 L22 16 L30 16"
          stroke="#10b981"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="30" cy="16" r="2" fill="#F59E0B" />
      </svg>

      <span
        className="text-2xl font-bold"
        style={{ fontFamily: "Inter, sans-serif", color: "#3b82f6" }}
      >
        FitTrack
      </span>
    </div>
  </Link>
);
