'use server'

import { revalidateTag } from "next/cache";

export default async function RevalidatePath(path: string) {
  revalidateTag(path);
}