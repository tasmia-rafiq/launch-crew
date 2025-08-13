"use client";

import React, { useActionState, useState } from "react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "./ui/button";
import { SendIcon } from "lucide-react";
import { formSchema } from "@/lib/validation";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createPitch, sas, uploadImage } from "@/lib/actions";
import { TagsInput } from "./TagInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const StartupForm = ({ id, postDetails }: { id: string; postDetails: any }) => {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({}); // we used record to define the type of errors as an object with string keys and string values because the title was not defined in the type of errors

  const [pitch, setPitch] = React.useState(postDetails.pitch || "");
  const [tags, setTags] = useState<string[]>(postDetails?.tags || []);

  const [selectedAudience, setSelectedAudience] = useState(
    postDetails?.audience &&
      ![
        "Students",
        "Professionals",
        "Startups",
        "Developers",
        "Designers",
        "Everyone",
      ].includes(postDetails.audience)
      ? "Other"
      : postDetails?.audience || ""
  );
  const [customAudience, setCustomAudience] = useState(
    selectedAudience === "Other" ? postDetails?.audience || "" : ""
  );

  const [selectedCategory, setSelectedCategory] = useState(
    postDetails?.category &&
      ![
        "AI",
        "HealthTech",
        "FinTech",
        "EdTech",
        "SaaS",
        "Productivity",
      ].includes(postDetails.category)
      ? "Other"
      : postDetails?.category || ""
  );
  const [customCategory, setCustomCategory] = useState(
    selectedCategory === "Other" ? postDetails?.category || "" : ""
  );

  const categories = [
    "AI",
    "HealthTech",
    "FinTech",
    "EdTech",
    "SaaS",
    "Productivity",
    "Other",
  ];
  const audiences = [
    "Students",
    "Professionals",
    "Startups",
    "Developers",
    "Designers",
    "Everyone",
    "Other",
  ];

  const handleFormSubmit = async (prevState: any, formData: FormData) => {
    try {
      const pictureFile = formData.get("picture") as File;
      let uploadedPicUrl = postDetails?.picture || "";

      if (pictureFile && pictureFile.size > 0) {
        const uploadedPic = await sas(pictureFile);

        if (uploadedPic.status !== "SUCCESS" || !uploadedPic.url) {
          toast.error("Picture upload failed.");
          return { ...prevState, status: "ERROR" };
        }

        uploadedPicUrl = uploadedPic.url;
      }
      const formValues = {
        id: id,
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        problem: formData.get("problem") as string,
        audience:
          selectedAudience === "Other" ? customAudience : selectedAudience,
        category:
          selectedCategory === "Other" ? customCategory : selectedCategory,
        picture: uploadedPicUrl,
        pitch,
        tags,
      };

      await formSchema.parseAsync(formValues);

      const result = await createPitch(prevState, formValues, pitch, tags);

      console.log("✅ ~ createPitch result:", result);

      if (result.status === "SUCCESS") {
        toast.success(
          id
            ? "Your startup idea has been updated successfully."
            : "Your startup idea has been submitted successfully."
        );
        router.push(`/startup/${result.slug?.current}`);
      }

      return result;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.flatten().fieldErrors;

        setErrors(fieldErrors as unknown as Record<string, string>);

        toast.error("Please check your inputs and try again.");
        return { ...prevState, error: "Validation failed", status: "ERROR" };
      }

      toast.error("Please check your inputs and try again.");
      return {
        ...prevState,
        error: "An unexpected error occurred",
        status: "ERROR",
      };
    }
  };

  // we used useActionState to handle the form submission and manage the state of the form. It is better than using useState because it provides a more structured way to handle the form submission and manage the state of the form. It also provides a way to handle errors and loading states.
  const [state, formAction, isPending] = useActionState(handleFormSubmit, {
    error: "",
    status: "INITIAL",
  });

  return (
    <form
      action={formAction}
      className="min-[991px]:!w-[60%] !w-full startup-form border-1 border-[#cecece] py-5 !px-5 rounded-lg shadow-2xl"
    >
      <h2 className="text-26-semibold !text-[22px]">Tell us about your Idea</h2>
      <div>
        <label htmlFor="title" className="startup-form_label">
          Title
        </label>
        <Input
          id="title"
          name="title"
          className="startup-form_input"
          required
          placeholder="Startup Title"
          defaultValue={postDetails.title || ""}
        />

        {errors.title && <p className="startup-form_error">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="description" className="startup-form_label">
          Short Description
        </label>
        <Textarea
          id="description"
          name="description"
          className="startup-form_textarea"
          required
          placeholder="Write a short description of your startup idea"
          defaultValue={postDetails.description || ""}
        />

        {errors.description && (
          <p className="startup-form_error">{errors.description}</p>
        )}
      </div>

      <div>
        <label htmlFor="problem" className="startup-form_label">
          Problem Your Startup Solves
        </label>
        <Textarea
          id="problem"
          name="problem"
          className="startup-form_textarea !h-[150px]"
          required
          placeholder="Clearly state the problem your startup solves"
          defaultValue={postDetails.problem || ""}
        />

        {errors.problem && (
          <p className="startup-form_error">{errors.problem}</p>
        )}
      </div>

      <div>
        <label htmlFor="audience" className="startup-form_label">
          Target Audience
        </label>
        <Select
          value={selectedAudience}
          onValueChange={(val) => {
            setSelectedAudience(val);
            if (val !== "Other") setCustomAudience(""); // reset custom input if not Other
          }}
        >
          <SelectTrigger
            className={`startup-form_input !w-full ${
              selectedAudience ? "!text-[#414141]" : "!text-black-300"
            }`}
          >
            <SelectValue placeholder="Select your target audience" />
          </SelectTrigger>
          <SelectContent className="bg-primary-100 border-[#cecece]">
            {audiences.map((audienceItem) => (
              <SelectItem
                className="cursor-pointer hover:bg-primary hover:text-white"
                key={audienceItem}
                value={audienceItem}
              >
                {audienceItem}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedAudience === "Other" && (
          <Input
            name="customAudience"
            className="startup-form_input mt-2"
            placeholder="Please specify"
            value={customAudience}
            onChange={(e) => setCustomAudience(e.target.value)}
          />
        )}

        {/* Hidden input to submit the actual audience */}
        <input
          type="hidden"
          name="audience"
          value={
            selectedAudience === "Other" ? customAudience : selectedAudience
          }
        />

        {errors.audience && (
          <p className="startup-form_error">{errors.audience}</p>
        )}
      </div>

      <div>
        <label htmlFor="category" className="startup-form_label">
          Category
        </label>
        <Select
          value={selectedCategory}
          onValueChange={(val) => {
            setSelectedCategory(val);
            if (val !== "Other") setCustomCategory(""); // reset custom input if not Other
          }}
        >
          <SelectTrigger
            className={`startup-form_input !w-full ${
              selectedCategory ? "!text-[#414141]" : "!text-black-300"
            }`}
          >
            <SelectValue placeholder="Select your startup category" />
          </SelectTrigger>
          <SelectContent className="bg-primary-100 border-[#cecece]">
            {categories.map((categoryItem) => (
              <SelectItem
                className="cursor-pointer hover:bg-primary hover:text-white"
                key={categoryItem}
                value={categoryItem}
              >
                {categoryItem}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedCategory === "Other" && (
          <Input
            name="customCategory"
            className="startup-form_input mt-2"
            placeholder="Please specify"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
          />
        )}

        {/* Hidden input to submit the actual audience */}
        <input
          type="hidden"
          name="category"
          value={
            selectedCategory === "Other" ? customCategory : selectedCategory
          }
        />

        {errors.category && (
          <p className="startup-form_error">{errors.category}</p>
        )}
      </div>

      <div>
        <label htmlFor="tags" className="startup-form_label">
          Tags
        </label>
        <TagsInput value={tags} onChange={setTags} />
        {errors.tags && <p className="startup-form_error">{errors.tags}</p>}
      </div>

      <div>
        <label htmlFor="picture" className="startup-form_label">
          {id ? "Update Picture / Logo" : "Picture / Logo"}
        </label>
        {id ? (
          <Input
            id="picture"
            name="picture"
            type="file"
            accept="image/*"
            className="startup-form_input !pt-1 !pb-4 w-full"
          />
        ) : (
          <Input
            id="picture"
            name="picture"
            type="file"
            accept="image/*"
            className="startup-form_input !pt-1 !pb-4 w-full"
            required
          />
        )}

        {errors.picture && (
          <p className="startup-form_error">{errors.picture}</p>
        )}
      </div>

      <div data-color-mode="light">
        <label htmlFor="pitch" className="startup-form_label">
          Pitch
        </label>
        <MDEditor
          value={pitch}
          onChange={(value) => setPitch(value || "")}
          id="pitch"
          preview="edit"
          height={300}
          style={{ borderRadius: 10, overflow: "hidden", marginTop: 10 }}
          textareaProps={{
            placeholder: "Briefly describe your idea and its impact",
            className: "!font-work-sans",
          }}
          previewOptions={{
            disallowedElements: ["style"],
          }}
        />

        {errors.pitch && <p className="startup-form_error">{errors.pitch}</p>}
      </div>

      <Button
        type="submit"
        className="startup-form_btn text-white"
        disabled={isPending}
      >
        {isPending
          ? "Submitting..."
          : id
            ? "Update Pitch"
            : "Submit Your Pitch"}
        <SendIcon className="size-6 ml-2" />
      </Button>
    </form>
  );
};

export default StartupForm;
