"use client";

import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { SendIcon, TriangleAlert } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { editProfile, uploadImage } from "@/lib/actions";
import { editProfileSchema } from "@/lib/validation";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const EditProfileForm = ({ defaultValues }: { defaultValues: any }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [removeImageFlag, setRemoveImageFlag] = useState(false);

  const router = useRouter();

  const handleFormSubmit = async (prevState: any, formData: FormData) => {
    try {
      let uploadedImage = { status: "SUCCESS", url: defaultValues.image };

      const imageFile = formData.get("image") as File;
      const hasNewImage = imageFile && imageFile.size > 0;

      const removeImage = formData.get("removeImage") === "true";

      if (hasNewImage) {
        uploadedImage = await uploadImage(imageFile);
        if (uploadedImage.status !== "SUCCESS") {
          toast.error("Image upload failed.");
          return { ...prevState, status: "ERROR" };
        }
      } else if (removeImage) {
        uploadedImage.url = ""; // Clear image
      }

      const values = {
        name: formData.get("name") as string,
        username: formData.get("username") as string,
        email: formData.get("email") as string,
        image: uploadedImage.url,
        bio: formData.get("bio") as string,
      };

      await editProfileSchema.parseAsync(values);

      const result = await editProfile(prevState, values);

      if (result.status === "SUCCESS") {
        toast.success("Profile updated successfully.");
        setPreviewImage(null);
        router.replace(`/user/${values.username}`);
        router.refresh(); // Refresh the page with updated data
      }

      if (result.status === "ERROR" && result.fieldErrors) {
        setErrors(result.fieldErrors);
      }

      return result;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(
          error.flatten().fieldErrors as unknown as Record<string, string>
        );
        toast.error("Please fix the errors and try again.");
        return { ...prevState, status: "ERROR" };
      }

      toast.error("An unexpected error occurred.");
      return { ...prevState, status: "ERROR" };
    }
  };

  const [state, formAction, isPending] = useActionState(handleFormSubmit, {
    status: "INITIAL",
  });

  // Reset preview image when defaultValues.image changes
  // useEffect(() => {
  //   setPreviewImage(null);
  // }, [defaultValues.image]);

  // Handle file input change for preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    }
  };

  return (
    <div className="px-3">
      <form action={formAction} className="flex flex-row md:gap-10 gap-4">
        <div className="startup-form">
          <h2 className="text-26-semibold mb-4">Edit Profile</h2>
          <div>
            <label htmlFor="name" className="startup-form_label">
              Name
            </label>
            <Input
              id="name"
              name="name"
              defaultValue={defaultValues.name}
              className="startup-form_input"
              required
              placeholder="Your Full Name"
            />
            {errors.name && (
              <p className="startup-form_error">
                <TriangleAlert className="size-3.5" /> {errors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="username" className="startup-form_label">
              Username
            </label>
            <Input
              id="username"
              name="username"
              defaultValue={defaultValues.username}
              className="startup-form_input"
              required
              placeholder="Username"
            />
            {errors.username && (
              <p className="startup-form_error">
                <TriangleAlert className="size-3.5" /> {errors.username}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="startup-form_label">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={defaultValues.email}
              className="startup-form_input"
              required
              placeholder="Email"
            />
            {errors.email && (
              <p className="startup-form_error">
                <TriangleAlert className="size-3.5" /> {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="bio" className="startup-form_label">
              Bio
            </label>
            <Textarea
              id="bio"
              name="bio"
              className="startup-form_textarea"
              required
              defaultValue={defaultValues.bio}
              placeholder="Write a brief bio about yourself"
            />

            {errors.bio && (
              <p className="startup-form_error">
                <TriangleAlert className="size-3.5" /> {errors.bio}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="startup-form_btn text-white"
            disabled={isPending}
          >
            {isPending ? "Saving..." : "Save Changes"}
            <SendIcon className="size-6 ml-2" />
          </Button>
        </div>

        <div className="max-sm:w-[30%]">
          <Avatar className="sm:size-40 size-20">
            <AvatarImage
              src={
                removeImageFlag
                  ? null
                  : previewImage || defaultValues.image || null
              }
              alt={defaultValues.name || "User Avatar"}
              className="object-cover"
            />
            <AvatarFallback>
              <span className="text-[50px] font-semibold bg-primary !text-white rounded-full flex items-center justify-center w-full h-full">
                {defaultValues.name?.charAt(0) || "U"}
              </span>
            </AvatarFallback>
          </Avatar>

          <div className="mt-4">
            <label htmlFor="image" className="startup-form_label">
              Update Your Avatar
            </label>
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              className="startup-form_input !pt-1 !pb-4 min-sm:!w-60 !w-30"
              onChange={handleImageChange}
            />
            {errors.image && (
              <p className="startup-form_error">
                <TriangleAlert className="size-3.5" /> {errors.image}
              </p>
            )}

            {(previewImage || defaultValues.image) && (
              <Button
                type="button"
                variant="outline"
                className="mt-2 text-sm text-red-600"
                onClick={() => {
                  setPreviewImage(null);
                  setRemoveImageFlag(true);
                  const hiddenField = document.getElementById(
                    "removeImageFlag"
                  ) as HTMLInputElement;
                  if (hiddenField) hiddenField.value = "true";
                }}
              >
                Remove Image
              </Button>
            )}
            <Input
              type="hidden"
              id="removeImageFlag"
              name="removeImage"
              value={removeImageFlag ? "true" : "false"}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProfileForm;
