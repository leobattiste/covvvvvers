"use server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { SUPABASE_URL } from "@/lib/supabase/config";

export async function moderateMember(form:FormData) {
 const {db,user:admin}=await requireAdmin("/admin/members");
 const id=String(form.get("id")??"");
 const status=String(form.get("status")??"");
 const reason=String(form.get("reason")??"").trim().slice(0,500);
 if(!/^[0-9a-f-]{36}$/i.test(id)||!["active","suspended","banned"].includes(status))throw new Error("Invalid member action.");
 if(id===admin.id)throw new Error("You cannot moderate your own account.");
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 const resendKey=process.env.RESEND_API_KEY;
 const sender=process.env.RESEND_FROM_EMAIL;
 if(!key||!resendKey||!sender)throw new Error("Member moderation requires SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY and RESEND_FROM_EMAIL configured on the server.");
 if(status!=="active"&&!reason)throw new Error("Provide a reason for the member.");
 const {data:profile,error:profileError}=await db.from("profiles").select("is_admin").eq("id",id).single();
 if(profileError||!profile||profile.is_admin)throw new Error("Administrator accounts cannot be moderated.");
 const service=createClient(SUPABASE_URL,key,{auth:{autoRefreshToken:false,persistSession:false}});
 const {data:target,error:targetError}=await service.auth.admin.getUserById(id);
 if(targetError||!target.user?.email)throw new Error("Member email could not be found.");
 const duration=status==="banned"?"876000h":status==="suspended"?"168h":"none";
 const {error:authError}=await service.auth.admin.updateUserById(id,{ban_duration:duration});
 if(authError)throw new Error("Unable to update account access: "+authError.message);
 const {error:saveError}=await db.from("member_moderation").upsert({user_id:id,status,reason:reason||null,updated_at:new Date().toISOString(),updated_by:admin.id});
 if(saveError)throw new Error("Account access changed, but moderation record could not be saved: "+saveError.message);
 const subject=status==="active"?"Your Covvvers account has been restored":status==="suspended"?"Your Covvvers account has been suspended":"Your Covvvers account has been banned";
 const detail=status==="active"?"Your access to Covvvers has been restored.":status==="suspended"?"Your access to Covvvers has been suspended for 7 days.":"Your access to Covvvers has been banned.";
 const body=detail+(reason?"\n\nReason: "+reason:"")+"\n\nIf you believe this was an error, reply to this email.";
 const sent=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":"Bearer "+resendKey,"Content-Type":"application/json"},body:JSON.stringify({from:sender,to:[target.user.email],subject,text:body}),cache:"no-store"});
 revalidatePath("/admin/members");
 if(!sent.ok)throw new Error("Account status changed, but notification email failed. Check Resend delivery before retrying: "+sent.status);
 redirect("/admin/members?updated="+status);
}
