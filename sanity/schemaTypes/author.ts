import { UserIcon } from "lucide-react";
import { defineField, defineType } from "sanity";

export const author = defineType({
  name: "author",
  title: "Author",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "id",
      title: "Provider ID",
      type: "string",
    }),
    defineField({
      name: "provider",
      title: "Provider",
      type: "string",
      options: {
        list: [
          { title: "GitHub", value: "github" },
          { title: "Google", value: "google" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "name",
      type: "string",
    }),
    defineField({
      name: "username",
      type: "string",
    }),
    defineField({
      name: "email",
      type: "string",
    }),
    defineField({
      name: "image",
      type: "url",
    }),
    defineField({
      name: "bio",
      type: "text",
    }),
    defineField({
      name: "lastLogin",
      title: "Last Login",
      type: "datetime",
    }),
  ],
  preview: {
    select: {
      title: "name",
    },
  },
});
