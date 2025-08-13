import { defineField, defineType } from "sanity";

export const startup = defineType({
  name: "startup",
  title: "Startup",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: {
        source: "title",
      },
    }),
    defineField({
      name: "author",
      type: "reference",
      to: { type: "author" },
    }),
    defineField({
      name: "views",
      type: "number",
    }),
    defineField({
      name: "description",
      type: "text",
    }),
    defineField({
      name: "problem",
      type: "text",
    }),
    defineField({
      name: "audience",
      type: "string",
      validation: (Rule) =>
        Rule.min(1).max(30).required().error("Audience is required"),
    }),
    defineField({
      name: "category",
      type: "string",
      validation: (Rule) =>
        Rule.min(1).max(30).required().error("Category is required"),
    }),
    defineField({
      name: "tags",
      type: "array",
      of: [{ type: "string" }],
      validation: (Rule) =>
        Rule.min(1).required().error("At least one tag is required"),
    }),
    defineField({
      name: "picture",
      type: "url",
    }),
    defineField({
      name: "pitch",
      type: "markdown",
    }),
    defineField({
      name: "viewedBy",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "userId", type: "string" },
            { name: "timestamp", type: "datetime" },
          ],
        },
      ],
    }),
    defineField({
      name: "aiInsights",
      type: "text",
    }),
  ],
});
