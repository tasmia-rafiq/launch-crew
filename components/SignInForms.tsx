import { signInWithGithub, signInWithGoogle } from "@/lib/auth-actions";
import { FaGithub, FaGoogle } from "react-icons/fa";

export const SignInForms = () => {
  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <form action={signInWithGithub}>
          <button type="submit" className="modal_btn">
            <FaGithub className="size-6" />
            <span>Sign in with GitHub</span>
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <form action={signInWithGoogle}>
          <button type="submit" className="modal_btn">
            <FaGoogle className="size-6 text-red-600" />
            <span>Sign in with Google</span>
          </button>
        </form>
      </div>
    </div>
  );
};
