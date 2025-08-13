import { client } from "@/sanity/lib/client";
import { AUTHOR_BY_ID_QUERY } from "@/sanity/lib/queries";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({}, { status: 400 });

  const author = await client.fetch(AUTHOR_BY_ID_QUERY, { id }, { useCdn: false });

  return NextResponse.json(author);
}