import { defineType, defineField } from "sanity";

export const feedback = defineType({
  name: "feedback",
  title: "Startup Feedback",
  type: "document",
  fields: [
    defineField({
      name: "post",
      title: "Startup Post",
      type: "reference",
      to: [{ type: "startup" }],
    }),
    defineField({
      name: "user",
      title: "User",
      type: "reference",
      to: [{ type: "author" }],
    }),
    defineField({
      name: "innovation",
      title: "Innovation",
      type: "number",
      validation: (Rule) => Rule.min(0).max(5),
    }),
    defineField({
      name: "problemClarity",
      title: "Problem Clarity",
      type: "number",
      validation: (Rule) => Rule.min(0).max(5),
    }),
    defineField({
      name: "solutionClarity",
      title: "Solution Clarity",
      type: "number",
      validation: (Rule) => Rule.min(0).max(5),
    }),
    defineField({
      name: "productMarketFit",
      title: "Product Market Fit",
      type: "number",
      validation: (Rule) => Rule.min(0).max(5),
    }),
    defineField({
      name: "execution",
      title: "Execution Potential",
      type: "number",
      validation: (Rule) => Rule.min(0).max(5),
    }),
    defineField({
      name: "monetization",
      title: "Monetization Potential",
      type: "number",
      validation: (Rule) => Rule.min(0).max(5),
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      "user.username": "user.username",
      "post.title": "post.title",
    },
    prepare(selection) {
      const { "user.username": username, "post.title": title } = selection;
      return {
        title: `Feedback by ${username}`,
        subtitle: `on ${title}`,
      };
    },
  },
});