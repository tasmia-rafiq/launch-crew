import { signOutSession } from "@/lib/auth-actions";
import { LogOut } from "lucide-react";

const SignoutForm = () => {
  return (
    <form action={signOutSession}>
      <button
        type="submit"
        className="cursor-pointer w-full text-left flex items-center gap-1.5"
      >
        <LogOut className="size-4" />
        <span className="max-sm:hidden">Logout</span>
      </button>
    </form>
  );
};

export default SignoutForm;
