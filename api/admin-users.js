const { createClient } = require("@supabase/supabase-js");

function json(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

function getSupabaseForUser(token) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const publicKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !publicKey) {
    throw new Error("Missing SUPABASE_URL/VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.");
  }
  return createClient(supabaseUrl, publicKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });
}

function getBearerToken(request) {
  const header = request.headers.authorization || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || "";
}

const ownerEmail = "entrepreneur@suiyuecare.com";

const ownerPermissions = {
  can_manage_users: true,
  can_publish: true,
  can_review_publish: true,
  can_edit_site_settings: true,
  can_view_pages: true,
  can_edit_pages: true,
  can_delete_pages: true,
  can_view_articles: true,
  can_edit_articles: true,
  can_delete_articles: true,
  can_view_media: true,
  can_manage_media: true,
  can_delete_media: true,
  can_view_courses: true,
  can_edit_courses: true,
  can_delete_courses: true,
  can_view_files: true,
  can_manage_files: true,
  can_delete_files: true,
  can_view_forms: true,
  can_edit_forms: true,
  can_export_forms: true,
  can_view_recruiting: true,
  can_edit_recruiting: true,
  can_delete_recruiting: true,
  can_view_investor: true,
  can_edit_investor: true,
  can_delete_investor: true,
  can_view_analytics: true,
  can_export_analytics: true,
  can_view_content_health: true,
  can_manage_backups: true
};

async function verifyRequest(request, supabase) {
  const token = getBearerToken(request);
  if (!token) {
    const error = new Error("Missing bearer token.");
    error.statusCode = 401;
    throw error;
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    const authError = new Error(error?.message || "Invalid session.");
    authError.statusCode = 401;
    throw authError;
  }

  return data.user;
}

async function getAuthorizedSupabase(request) {
  const token = getBearerToken(request);
  if (!token) {
    const error = new Error("Missing bearer token.");
    error.statusCode = 401;
    throw error;
  }

  try {
    const adminClient = getSupabaseAdmin();
    const user = await verifyRequest(request, adminClient);
    return { supabase: adminClient, user, mode: "service_role" };
  } catch (error) {
    console.warn("Falling back to user-scoped admin-users client.", error.message);
  }

  const userClient = getSupabaseForUser(token);
  const { data, error } = await userClient.auth.getUser(token);
  if (error || !data?.user) {
    const authError = new Error(error?.message || "Invalid session.");
    authError.statusCode = 401;
    throw authError;
  }
  return { supabase: userClient, user: data.user, mode: "rls" };
}

async function getCurrentAdmin(supabase, user) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, user_id, email, role, is_active, admins(*)")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function profilesCount(supabase) {
  const { count, error } = await supabase.from("profiles").select("id", { count: "exact", head: true });
  if (error) throw error;
  return count || 0;
}

function canManageUsers(user, currentAdmin, totalProfiles) {
  const email = String(user.email || "").toLowerCase();
  if (email === ownerEmail) return true;
  if (totalProfiles === 0) return true;
  if (currentAdmin?.role === "owner") return true;
  const adminRecord = Array.isArray(currentAdmin?.admins) ? currentAdmin.admins[0] : currentAdmin?.admins;
  return Boolean(currentAdmin?.is_active && adminRecord?.is_active && adminRecord?.can_manage_users);
}

async function ensureProfileForCurrentUser(supabase, user, totalProfiles) {
  const email = String(user.email || "").toLowerCase();
  const shouldBeOwner = email === ownerEmail || totalProfiles === 0;
  const displayName = user.user_metadata?.full_name || user.user_metadata?.name || (shouldBeOwner ? "歲悅長照 Owner" : email);
  const role = shouldBeOwner ? "owner" : "viewer";

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .upsert({
      user_id: user.id,
      email,
      display_name: displayName,
      role,
      avatar_url: user.user_metadata?.avatar_url || null,
      is_active: true
    }, { onConflict: "user_id" })
    .select("id")
    .single();

  if (profileError) throw profileError;

  if (shouldBeOwner) {
    const { error: adminError } = await supabase
      .from("admins")
      .upsert({
        profile_id: profile.id,
        role: "owner",
        is_active: true,
        ...ownerPermissions
      }, { onConflict: "profile_id" });
    if (adminError) throw adminError;
  }

  return profile.id;
}

async function listUsers(supabase) {
  const [{ data: profiles, error: profileError }, { data: admins, error: adminError }] = await Promise.all([
    supabase.from("profiles").select("id,user_id,email,display_name,role,is_active,updated_at").order("updated_at", { ascending: false }),
    supabase.from("admins").select("*")
  ]);

  if (profileError) throw profileError;
  if (adminError) throw adminError;

  return { profiles: profiles || [], admins: admins || [] };
}

async function handleUpdate(request, response, supabase, user, totalProfiles) {
  const currentAdmin = await getCurrentAdmin(supabase, user);
  if (!canManageUsers(user, currentAdmin, totalProfiles)) {
    return json(response, 403, { ok: false, message: "You do not have permission to manage users." });
  }

  const body = await new Promise((resolve, reject) => {
    let raw = "";
    request.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) reject(new Error("Request body too large."));
    });
    request.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });

  const profileId = body.profile_id;
  if (!profileId) return json(response, 400, { ok: false, message: "Missing profile_id." });

  const { data: targetProfile, error: targetProfileError } = await supabase
    .from("profiles")
    .select("id,email,role")
    .eq("id", profileId)
    .maybeSingle();
  if (targetProfileError) throw targetProfileError;
  if (!targetProfile) return json(response, 404, { ok: false, message: "Profile not found." });

  const targetEmail = String(body.email || targetProfile.email || "").toLowerCase();
  const requestedRole = body.role || "viewer";
  const normalizedRole = targetEmail === ownerEmail ? "owner" : requestedRole === "owner" ? "admin" : requestedRole;
  if (requestedRole === "owner" && targetEmail !== ownerEmail) {
    return json(response, 403, { ok: false, message: "只有 entrepreneur@suiyuecare.com 可以是最高權限 Owner。其他管理者請設定為 Admin。" });
  }

  const profilePayload = {
    role: targetEmail === ownerEmail ? "owner" : normalizedRole,
    display_name: body.display_name || null,
    email: targetEmail || null,
    is_active: Boolean(body.is_active)
  };
  const { error: profileError } = await supabase.from("profiles").update(profilePayload).eq("id", profileId);
  if (profileError) throw profileError;

  const adminPayload = {
    profile_id: profileId,
    role: profilePayload.role,
    is_active: Boolean(body.is_active)
  };
  Object.keys(ownerPermissions).forEach((key) => {
    adminPayload[key] = Boolean(body[key]);
  });
  const isOwnerRole = targetEmail === ownerEmail && adminPayload.role === "owner";
  adminPayload.can_publish = isOwnerRole;
  adminPayload.can_review_publish = isOwnerRole;
  const { error: adminError } = await supabase.from("admins").upsert(adminPayload, { onConflict: "profile_id" });
  if (adminError) throw adminError;

  return json(response, 200, { ok: true, message: "User permissions saved." });
}

module.exports = async function handler(request, response) {
  try {
    if (!["GET", "POST"].includes(request.method)) {
      response.setHeader("Allow", "GET, POST");
      return json(response, 405, { ok: false, message: "Method not allowed" });
    }

    const { supabase, user, mode } = await getAuthorizedSupabase(request);
    const totalProfiles = await profilesCount(supabase);
    const currentAdmin = await getCurrentAdmin(supabase, user);
    if (!canManageUsers(user, currentAdmin, totalProfiles)) {
      return json(response, 403, { ok: false, message: "You do not have permission to manage users." });
    }

    await ensureProfileForCurrentUser(supabase, user, totalProfiles);

    if (request.method === "POST") {
      return handleUpdate(request, response, supabase, user, totalProfiles);
    }

    const data = await listUsers(supabase);
    return json(response, 200, { ok: true, authMode: mode, ...data });
  } catch (error) {
    console.error("admin-users api failed", error);
    return json(response, error.statusCode || 500, { ok: false, message: error.message || "Unexpected error." });
  }
};
