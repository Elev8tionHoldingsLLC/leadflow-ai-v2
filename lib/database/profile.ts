import type { ProfileSettings } from "@/types/leadflow";
import type { DatabaseProfile } from "@/types/database";
import { DEFAULT_PROFILE } from "@/types/leadflow";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { mapDatabaseProfile } from "@/lib/database/mappers";

function getSupabase() {
  return createSupabaseBrowserClient();
}

export async function fetchProfile() {
  const supabase = getSupabase();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return DEFAULT_PROFILE;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return mapDatabaseProfile(data as DatabaseProfile | null);
}

export async function upsertProfile(profile: ProfileSettings) {
  const supabase = getSupabase();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be logged in to update your profile.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      display_name: profile.displayName,
      role: profile.role,
      profile_image: profile.profileImage,
      tagline: profile.tagline,
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapDatabaseProfile(data as DatabaseProfile);
}