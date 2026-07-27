"use server";

import { revalidatePath } from "next/cache";

export async function revalidatePublicComercios() {
  revalidatePath("/comercios");
}
