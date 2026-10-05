import type { RatingOption } from "../ratings.ts";

interface RatingIconProps {
  option: Pick<RatingOption, "color" | "path"> | null;
  size?: string;
}

function RatingIcon({ option, size = "1em" }: RatingIconProps) {
  return (
    <svg
      aria-hidden="true"
      className="rating-icon"
      height={size}
      viewBox="0 0 16 16"
      width={size}
    >
      {option ? (
        <path
          d={option.path}
          fill={option.color}
          fillRule="evenodd"
          stroke="rgba(0,0,0,0.55)"
          strokeLinejoin="round"
          strokeWidth="0.7"
        />
      ) : (
        <circle
          cx="8"
          cy="8"
          fill="none"
          r="3.5"
          stroke="#b5b5bd"
          strokeWidth="1.2"
        />
      )}
    </svg>
  );
}

export default RatingIcon;
