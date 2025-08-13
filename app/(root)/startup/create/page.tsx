import { auth } from "@/auth";
import StartupForm from "@/components/StartupForm";
import {
  FileTextIcon,
  FoldersIcon,
  ImageIcon,
  MessageCircleWarningIcon,
  TagsIcon,
  UsersRoundIcon,
} from "lucide-react";
import { redirect } from "next/navigation";
import { FaBullhorn } from "react-icons/fa";

const page = async () => {
  const session = await auth();

  if (!session) redirect("/");

  return (
    <>
      <section className="pink_container mt-22.5 !min-h-[230px]">
        <h1 className="heading">Submit Your Startup Idea</h1>
        <h2 className="sub-heading">
          Share your vision with the world and validate your startup with the
          LaunchCrew community.
        </h2>
      </section>

      <section className="py-10 sm:px-6 px-3 flex min-[991px]:flex-row flex-col-reverse justify-between items-start gap-6">
        <div className="min-[991px]:w-[40%] w-full border-1 border-[#cecece] rounded-lg sm:p-5 p-3 prism-bg">
          <h2 className="text-26-semibold !text-[22px]">
            What Makes a Great Submission?
          </h2>

          <ul className="pt-4 space-y-5">
            <li className="flex gap-2 items-start">
              <div>
                <FileTextIcon className="size-5 text-secondary" />
              </div>
              <div className="flex flex-col items-start gap-1">
                <h3 className="text-16-medium !font-semibold leading-5">
                  Craft a Clear Title
                </h3>
                <p className="text-14-normal !text-black-100 leading-5">
                  Use a concise, catchy title that instantly communicates your
                  idea.
                  <br />
                  Example: <b>"RemoteMind – AI..."</b>
                </p>
              </div>
            </li>

            <li className="flex gap-2 items-start">
              <div>
                <FileTextIcon className="size-5 text-secondary" />
              </div>
              <div className="flex flex-col items-start gap-1">
                <h3 className="text-16-medium !font-semibold leading-5">
                  Write a Short Description
                </h3>
                <p className="text-14-normal !text-black-100 leading-5">
                  Add a 1–2 sentence summary that explains your idea at a
                  glance, keep it punchy and clear. Example: <b>“An AI-driven tool that helps
                  remote teams monitor mental wellness in real-time.”</b>
                </p>
              </div>
            </li>

            <li className="flex gap-2 items-start">
              <div>
                <MessageCircleWarningIcon className="size-5 text-secondary" />
              </div>
              <div className="flex flex-col items-start gap-1">
                <h3 className="text-16-medium !font-semibold leading-5">
                  Describe the Problem
                </h3>
                <p className="text-14-normal !text-black-100 leading-5">
                  Clearly explain the problem your startup solves. The more
                  relatable and urgent, the better your chances of attracting
                  interest and validation.
                </p>
              </div>
            </li>

            <li className="flex gap-2 items-start">
              <div>
                <UsersRoundIcon className="size-5 text-secondary" />
              </div>
              <div className="flex flex-col items-start gap-1">
                <h3 className="text-16-medium !font-semibold leading-5">
                  Define Your Audience
                </h3>
                <p className="text-14-normal !text-black-100 leading-5">
                  Who is this idea for? Mention your target users, industries,
                  or niche communities that benefit most.
                </p>
              </div>
            </li>

            <li className="flex gap-2 items-start">
              <div>
                <FoldersIcon className="size-5 text-secondary" />
              </div>
              <div className="flex flex-col items-start gap-1">
                <h3 className="text-16-medium !font-semibold leading-5">
                  Pick Right Category
                </h3>
                <p className="text-14-normal !text-black-100 leading-5">
                  Choose the most relevant category for your startup. E.g. "AI",
                  "HealthTech", "FinTech", etc.
                </p>
              </div>
            </li>

            <li className="flex gap-2 items-start">
              <div>
                <TagsIcon className="size-5 text-secondary" />
              </div>
              <div className="flex flex-col items-start gap-1">
                <h3 className="text-16-medium !font-semibold leading-5">
                  Use Tags Thoughtfully
                </h3>
                <p className="text-14-normal !text-black-100 leading-5">
                  Add relevant tags to help others discover your idea. Use
                  specific keywords that reflect your startup's focus.
                </p>
              </div>
            </li>

            <li className="flex gap-2 items-start">
              <div>
                <ImageIcon className="size-5 text-secondary" />
              </div>
              <div className="flex flex-col items-start gap-1">
                <h3 className="text-16-medium !font-semibold leading-5">
                  Add a Strong Visual
                </h3>
                <p className="text-14-normal !text-black-100 leading-5">
                  Upload a relevant image or logo that represents your startup.
                  A good visual can make your submission stand out and be more
                  memorable.
                </p>
              </div>
            </li>

            <li className="flex gap-2 items-start">
              <div>
                <FaBullhorn className="size-5 text-secondary" />
              </div>
              <div className="flex flex-col items-start gap-1">
                <h3 className="text-16-medium !font-semibold leading-5">
                  Write a Convincing Pitch
                </h3>
                <p className="text-14-normal !text-black-100 leading-5">
                  Your pitch should be clear, concise, and compelling. Use
                  markdown to structure a compelling narrative:
                  <br />
                  <b>Problem → Solution → Market → Value → Revenue → Timing</b>
                </p>
              </div>
            </li>
          </ul>
        </div>
        <StartupForm id="" postDetails={""} />
      </section>
    </>
  );
};

export default page;
