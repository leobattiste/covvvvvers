"use server";

import { revalidatePath } from "next/cache";
import { adminClient } from "@/lib/admin";
import { slugify } from "@/lib/text";

function field(form: FormData, key: string, max = 300) {
  return String(form.get(key) ?? "").trim().slice(0, max);
}
function uuid(value: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) throw new Error("Invalid record identifier.");
  return value;
}
export async function saveCreator(form: FormData) {
  const db = await adminClient();
  const id = field(form, "id");
  const name = field(form, "name", 180);
  const role = field(form, "role", 120);
  if (!name) throw new Error("Creator name is required.");
  if (id) {
    const { error } = await db.from("creators").update({ name, role: role || null }).eq("id", uuid(id));
    if (error) throw new Error("Unable to save creator.");
  } else {
    const slug = slugify(name);
    if (!slug) throw new Error("Invalid creator name.");
    const { error } = await db.from("creators").insert({ slug, name, role: role || null });
    if (error) throw new Error("Unable to create creator. Check for an existing name or slug.");
  }
  revalidatePath("/admin/creators");
  revalidatePath("/", "layout");
}
export async function saveCoverType(form: FormData) {
  const db = await adminClient();
  const id = uuid(field(form, "id"));
  const title = field(form, "title", 120);
  const description = field(form, "description", 1200);
  const order = Number(field(form, "sort_order"));
  if (!title || !Number.isSafeInteger(order) || order < 0 || order > 10000) throw new Error("Invalid type details.");
  const { error } = await db.from("cover_types").update({ title, description: description || null, sort_order: order }).eq("id", id);
  if (error) throw new Error("Unable to save cover type.");
  revalidatePath("/admin/types");
  revalidatePath("/", "layout");
}
