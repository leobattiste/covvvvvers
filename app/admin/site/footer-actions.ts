"use server";
import { revalidatePath } from "next/cache";
import { adminClient } from "@/lib/admin";

export async function saveFooter(form: FormData) {
  const db = await adminClient();
  const value = String(form.get("footer_description") ?? "").trim();
  if (!value || value.length > 400) throw new Error("Footer text must be 1–400 characters.");
  const result = await db.from("site_settings").update({ value, updated_at: new Date().toISOString() }).eq("key", "footer_description").select("key");
  if (result.error || !result.data?.length) throw new Error("Unable to save footer.");
  revalidatePath("/", "layout");
  revalidatePath("/admin/site");
}
