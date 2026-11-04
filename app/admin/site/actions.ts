"use server";

import { revalidatePath } from "next/cache";
import { adminClient } from "@/lib/admin";

export async function saveHomepage(form: FormData) {
  const db = await adminClient();
  const title = String(form.get("home_title") ?? "").trim();
  const description = String(form.get("home_description") ?? "").trim();
  if (!title || title.length > 120) throw new Error("Headline must be 1–120 characters.");
  if (description.length > 300) throw new Error("Description cannot exceed 300 characters.");
  for (const [key, value] of [["home_title", title], ["home_description", description]]) {
    const { error } = await db.from("site_settings").update({ value, updated_at: new Date().toISOString() }).eq("key", key);
    if (error) throw new Error("Could not save homepage settings.");
  }
  revalidatePath("/");
  revalidatePath("/admin/site");
}
