const { createClient } = require("@supabase/supabase-js");

function json(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

function decodeJwtPayload(token = "") {
  const parts = String(token || "").split(".");
  if (parts.length < 2) return null;

  try {
    const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

function projectRefFromSupabaseUrl(url = "") {
  const match = String(url || "").match(/^https:\/\/([a-z0-9-]+)\.supabase\.co/i);
  return match?.[1] || "";
}

function serviceRoleProjectMatches() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const payload = decodeJwtPayload(serviceRoleKey);
  return Boolean(payload?.role === "service_role" && payload?.ref === projectRefFromSupabaseUrl(supabaseUrl));
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

function readJsonBody(request, maxBytes = 100_000) {
  return new Promise((resolve, reject) => {
    let raw = "";
    let settled = false;

    function finish(error, payload) {
      if (settled) return;
      settled = true;
      if (error) reject(error);
      else resolve(payload);
    }

    request.on("data", (chunk) => {
      if (settled) return;
      raw += chunk;
      if (raw.length > maxBytes) {
        const error = new Error("Request body too large.");
        error.statusCode = 413;
        finish(error);
      }
    });
    request.on("end", () => {
      if (settled) return;
      try {
        finish(null, raw ? JSON.parse(raw) : {});
      } catch {
        const error = new Error("Invalid JSON body.");
        error.statusCode = 400;
        finish(error);
      }
    });
    request.on("error", finish);
  });
}

const ownerEmail = "entrepreneur@suiyuecare.com";
const contentScopeKeys = new Set([
  "page:home",
  "page:about",
  "page:contact",
  "courses",
  "health",
  "investor",
  "recruiting:talent",
  "recruiting:partnership",
  "brand",
  "service:home-care",
  "service:day-care",
  "service:community",
  "service:nursing",
  "service:migrant-training",
  "service:quality",
  "service:software",
  "site:settings",
  "files",
  "forms:contact",
  "forms:courses",
  "forms:talent",
  "forms:partnership",
  "forms:brand",
  "forms:system"
]);

const departmentMembershipRoles = new Set(["viewer", "editor", "manager"]);
const departmentRoleRank = { viewer: 1, editor: 2, manager: 3 };
const profileRoles = new Set(["owner", "admin", "editor", "viewer"]);

function normalizeContentScopes(scopes) {
  if (!Array.isArray(scopes)) return [];
  return [...new Set(scopes.filter((scope) => typeof scope === "string" && contentScopeKeys.has(scope)))];
}

function normalizeDepartmentMemberships(assignments, validDepartmentIds = new Set()) {
  if (!Array.isArray(assignments)) return [];
  const normalizedByDepartment = new Map();

  assignments.forEach((assignment) => {
    const departmentId = String(assignment?.department_id || "").trim();
    const membershipRole = String(assignment?.membership_role || "").trim();
    if (!validDepartmentIds.has(departmentId) || !departmentMembershipRoles.has(membershipRole)) return;

    const existing = normalizedByDepartment.get(departmentId);
    if (!existing || departmentRoleRank[membershipRole] > departmentRoleRank[existing.membership_role]) {
      normalizedByDepartment.set(departmentId, {
        department_id: departmentId,
        membership_role: membershipRole
      });
    }
  });

  return [...normalizedByDepartment.values()];
}

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

  if (serviceRoleProjectMatches()) {
    try {
      const adminClient = getSupabaseAdmin();
      const user = await verifyRequest(request, adminClient);
      return { supabase: adminClient, user, mode: "service_role" };
    } catch (error) {
      console.warn("Falling back to user-scoped admin-users client.", error.message);
    }
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
  return Boolean(currentAdmin?.is_active && currentAdmin?.role === "owner");
}

async function ensureProfileForCurrentUser(supabase, user, totalProfiles) {
  const email = String(user.email || "").toLowerCase();
  const shouldBeOwner = email === ownerEmail;
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
  const [
    { data: profiles, error: profileError },
    { data: admins, error: adminError },
    { data: contentScopes, error: scopeError },
    { data: departments, error: departmentError },
    { data: departmentMemberships, error: membershipError },
    { data: contentAreas, error: contentAreaError }
  ] = await Promise.all([
    supabase.from("profiles").select("id,user_id,email,display_name,role,is_active,updated_at").order("updated_at", { ascending: false }),
    supabase.from("admins").select("*"),
    supabase.from("admin_content_scopes").select("profile_id,scope_key"),
    supabase.from("departments").select("id,slug,name,description,sort_order,is_active").eq("is_active", true).order("sort_order", { ascending: true }),
    supabase.from("department_memberships").select("department_id,profile_id,membership_role,is_active").eq("is_active", true),
    supabase.from("cms_content_areas").select("scope_key,name,description,department_id,frontend_path,admin_path,sort_order,is_active").eq("is_active", true).order("sort_order", { ascending: true })
  ]);

  if (profileError) throw profileError;
  if (adminError) throw adminError;
  if (scopeError) throw scopeError;
  if (departmentError) throw departmentError;
  if (membershipError) throw membershipError;
  if (contentAreaError) throw contentAreaError;

  return {
    profiles: profiles || [],
    admins: admins || [],
    contentScopes: contentScopes || [],
    departments: departments || [],
    departmentMemberships: departmentMemberships || [],
    contentAreas: contentAreas || []
  };
}

async function handleUpdate(response, supabase, user, totalProfiles, body) {
  const currentAdmin = await getCurrentAdmin(supabase, user);
  if (!canManageUsers(user, currentAdmin, totalProfiles)) {
    return json(response, 403, { ok: false, message: "You do not have permission to manage users." });
  }

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
  const requestedRole = String(body.role || "viewer").trim().toLowerCase();
  if (!profileRoles.has(requestedRole)) {
    return json(response, 400, { ok: false, message: "Invalid profile role." });
  }
  const normalizedRole = targetEmail === ownerEmail ? "owner" : requestedRole === "owner" ? "admin" : requestedRole;
  if (requestedRole === "owner" && targetEmail !== ownerEmail) {
    return json(response, 403, { ok: false, message: "只有 entrepreneur@suiyuecare.com 可以是最高權限 Owner。其他管理者請設定為 Admin。" });
  }

  const profilePayload = {
    role: targetEmail === ownerEmail ? "owner" : normalizedRole,
    display_name: body.display_name || null,
    email: targetEmail || null,
    is_active: targetEmail === ownerEmail ? true : Boolean(body.is_active)
  };
  const { error: profileError } = await supabase.from("profiles").update(profilePayload).eq("id", profileId);
  if (profileError) throw profileError;

  const adminPayload = {
    profile_id: profileId,
    role: profilePayload.role,
    is_active: profilePayload.is_active
  };
  Object.keys(ownerPermissions).forEach((key) => {
    adminPayload[key] = Boolean(body[key]);
  });
  const isOwnerRole = targetEmail === ownerEmail && adminPayload.role === "owner";
  adminPayload.can_manage_users = isOwnerRole;
  adminPayload.can_publish = isOwnerRole;
  adminPayload.can_review_publish = isOwnerRole;
  adminPayload.can_delete_media = isOwnerRole;
  const { error: adminError } = await supabase.from("admins").upsert(adminPayload, { onConflict: "profile_id" });
  if (adminError) throw adminError;

  const [{ data: departments, error: departmentsError }, { data: contentAreas, error: contentAreasError }] = await Promise.all([
    supabase.from("departments").select("id").eq("is_active", true),
    supabase.from("cms_content_areas").select("scope_key,department_id").eq("is_active", true)
  ]);
  if (departmentsError) throw departmentsError;
  if (contentAreasError) throw contentAreasError;

  const validDepartmentIds = new Set((departments || []).map((department) => department.id));
  let requestedMemberships = normalizeDepartmentMemberships(body.department_memberships, validDepartmentIds);

  // Compatibility for a cached version of the old permission page. Legacy
  // scope checkboxes are converted into editor memberships by department.
  if (!Array.isArray(body.department_memberships) && Array.isArray(body.content_scopes)) {
    const requestedScopes = normalizeContentScopes(body.content_scopes);
    requestedMemberships = normalizeDepartmentMemberships(
      (contentAreas || [])
        .filter((area) => requestedScopes.includes(area.scope_key))
        .map((area) => ({ department_id: area.department_id, membership_role: "editor" })),
      validDepartmentIds
    );
  }

  if (isOwnerRole) requestedMemberships = [];

  const { error: membershipError } = await supabase.rpc("replace_department_memberships", {
    target_profile_id: profileId,
    assignments: requestedMemberships
  });
  if (membershipError) throw membershipError;

  return json(response, 200, { ok: true, message: "User permissions and department responsibilities saved." });
}

async function handleContentAreaUpdate(response, supabase, body) {
  const assignments = body.content_area_assignments;
  if (!Array.isArray(assignments) || !assignments.length) {
    return json(response, 400, { ok: false, message: "內容責任配置不可為空。" });
  }
  if (assignments.some((assignment) => (
    !contentScopeKeys.has(String(assignment?.scope_key || ""))
    || !String(assignment?.department_id || "").trim()
  ))) {
    return json(response, 400, { ok: false, message: "內容責任配置包含無效範圍或部門。" });
  }

  const { error } = await supabase.rpc("replace_content_area_assignments", {
    assignments
  });
  if (error) throw error;
  return json(response, 200, { ok: true, message: "Content ownership assignments saved." });
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
      const body = await readJsonBody(request);
      if (body.action === "update_content_areas") {
        return handleContentAreaUpdate(response, supabase, body);
      }
      return handleUpdate(response, supabase, user, totalProfiles, body);
    }

    const data = await listUsers(supabase);
    return json(response, 200, { ok: true, authMode: mode, ...data });
  } catch (error) {
    console.error("admin-users api failed", error);
    const statusCode = error.statusCode || 500;
    return json(response, statusCode, {
      ok: false,
      message: statusCode >= 500 ? "Unexpected error." : error.message || "Unexpected error."
    });
  }
};
