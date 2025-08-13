import { defineField, defineType } from "sanity";

export const comment = defineType({
  name: "comment",
  title: "Comment",
  type: "document",
  fields: [
    defineField({
      name: "content",
      title: "Content",
      type: "markdown",
    }),
    defineField({
      name: "user",
      title: "User",
      type: "reference",
      to: [{ type: "author" }],
    }),
    defineField({
      name: "parent",
      title: "Parent Comment",
      type: "reference",
      to: [{ type: "comment" }],
      description: "Used for replies",
    }),
    defineField({
      name: "post",
      title: "Startup Post",
      type: "reference",
      to: [{ type: "startup" }],
    }),
    defineField({
      name: "likes",
      title: "Likes",
      type: "array",
      of: [{ type: "reference", to: [{ type: "author" }] }],
      initialValue: [],
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
      'user.username': 'user.username',
      'post.title': 'post.title',
    },
    prepare(selection) {
      const { 'user.username': username, 'post.title': postTitle } = selection;
      return {
        title: `Comment by ${username}`,
        subtitle: `on ${postTitle}`,
      };
    }
  }
});
