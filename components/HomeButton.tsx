import Link from "next/link";

interface HomeButtonProps {
  withText?: boolean;
}

export const HomeButton = ({ withText = false }: HomeButtonProps) => {
  return (
    <Link href="/" aria-label="Go to homepage">
      <div className="flex items-center gap-2 cursor-pointer">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 128 128"
        >
          <circle cx="64" cy="64" r="63" fill="#F9DC4A" />
          <path d="M0 64 H128 V128 H0 Z" fill="#3970B0" />
        </svg>

        {withText && (
          <span className="font-bold text-[#5e5e5e]">
            Vattenfall Warranty Claim
          </span>
        )}
      </div>
    </Link>
  );
};
