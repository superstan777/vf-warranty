import Link from "next/link";

interface HomeButtonProps {
  withText?: boolean;
}

export const HomeButton = ({ withText = false }: HomeButtonProps) => {
  return (
    <Link href="/">
      <div className="flex items-center gap-2 cursor-pointer">
        <div className="w-8 h-8 rounded-full overflow-hidden flex flex-col">
          <div className="flex-1 bg-[#F9DC4A]"></div>
          <div className="flex-1 bg-[#3970B0]"></div>
        </div>

        {withText && (
          <span className="font-bold text-[#5e5e5e]">
            Vattenfall Warranty Claim
          </span>
        )}
      </div>
    </Link>
  );
};
