import { HomeButton } from "@/components/HomeButton";
import { SignInWithMicrosoftButton } from "@/components/SignInButton";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center items-center gap-2 md:justify-start">
          <HomeButton withText={true} />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <SignInWithMicrosoftButton />
        </div>
      </div>

      <div className=" relative hidden lg:flex items-center justify-center">
        <div className="w-lg h-lg overflow-hidden rounded-t-full">
          <img
            src="https://group.vattenfall.com/cdn-cgi/image/width=1494,format=auto,fit=crop,height=1494/globalassets/com/sustainability/beach_sun_1x1.jpg"
            alt="Image"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
