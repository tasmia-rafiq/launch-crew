import { defineField, defineType } from "sanity";

export const vote = defineType({
  name: "vote",
  title: "Vote",
  type: "document",
  fields: [
    defineField({
      name: "user",
      title: "User",
      type: "reference",
      to: [{ type: "author" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "post",
      title: "Startup Post",
      type: "reference",
      to: [{ type: "startup" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
  ],

  // optional access control
  preview: {
    select: {
      title: "user.username",
    },
  },
});
