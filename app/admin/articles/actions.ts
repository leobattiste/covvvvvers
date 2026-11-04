"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminClient } from "@/lib/admin";
import { slugify } from "@/lib/text";

export async function createArticle(form: FormData) {
 const db = await adminClient();
 const title = String(form.get("title") ?? "").trim();
 if (!title || title.length > 180) throw new Error("Enter a title under 180 characters.");
 const base = slugify(title) || "article";
 let slug = base;
 for (let i = 2; i < 100; i++) {
  const { data } = await db.from("articles").select("id").eq("slug", slug).maybeSingle();
  if (!data) break;
  slug = base + "-" + i;
 }
 const { data, error } = await db.from("articles").insert({ title, slug }).select("id").single();
 if (error || !data) throw new Error("Unable to create article.");
 revalidatePath("/admin/articles");
 redirect("/admin/articles/" + data.id);
}

export async function saveArticle(form: FormData) {
 const db = await adminClient();
 const id = String(form.get("id") ?? "");
 if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error("Invalid article.");
 const title = String(form.get("title") ?? "").trim();
 const excerpt = String(form.get("excerpt") ?? "").trim();
 const body = String(form.get("body") ?? "").trim();
 const author = String(form.get("author") ?? "").trim() || "Covvvvvers";
 const cover_image = String(form.get("cover_image") ?? "").trim();
 const category = String(form.get("category") ?? "Story");
 const status = String(form.get("status") ?? "draft");
 if (!title || title.length > 180 || excerpt.length > 400 || body.length > 100000 || author.length > 120) throw new Error("Check article field lengths.");
 if (!["Story","Interview","Essay","News"].includes(category) || !["draft","published"].includes(status)) throw new Error("Invalid category or status.");
 if (cover_image && (!/^https:\/\//i.test(cover_image) || cover_image.length > 2000)) throw new Error("Use an HTTPS image URL.");
 if (status === "published" && (!body || !excerpt)) throw new Error("Add a summary and article body before publishing.");
 const { data: existing } = await db.from("articles").select("status,published_at,slug").eq("id",id).single();
 if (!existing) throw new Error("Article not found.");
 const { error } = await db.from("articles").update({
  title,excerpt,body,author,cover_image:cover_image || null,category,status,
  published_at: status === "published" ? (existing.published_at || new Date().toISOString()) : null,
  updated_at:new Date().toISOString()
 }).eq("id",id);
 if (error) throw new Error("Unable to save article.");
 revalidatePath("/articles");
 revalidatePath("/articles/" + existing.slug);
 revalidatePath("/admin/articles");
 revalidatePath("/admin/articles/" + id);
 redirect("/admin/articles/" + id + "?saved=1");
}
