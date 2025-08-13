import { client } from "./client";
import { AUTHOR_BY_ID_QUERY } from "./queries";

export const getUserById = async (id: string) => {
  if (!id) return null;

  return await client.fetch(AUTHOR_BY_ID_QUERY, { id });
};
