import { z } from 'zod';

export const formSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().min(10).max(1000),
    problem: z.string().min(10),
    audience: z.string().min(1).max(30),
    category: z.string().min(1).max(20),
    tags: z.array(z.string().min(1)).min(1, "At least one tag is required"),
    picture: z.any(),
    pitch: z.string().min(10),
});

export const editProfileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  username: z.string().min(2, "Username is required"),
  email: z.string().email("Invalid email"),
  image: z.any().optional(),
  bio: z.string().max(500, "Bio must be under 500 characters").optional(),
});

export const commentSchema = z.object({
    content: z.string(),
});