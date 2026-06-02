"use client";

import { useEffect, useState } from "react";
import {
  Brush,
  CheckCircle2,
  Image,
  Monitor,
  Palette,
  Save,
  User,
} from "lucide-react";
import type { ProfileSettings } from "@/types/leadflow";
import { DEFAULT_PROFILE } from "@/types/leadflow";
import { fetchProfile, upsertProfile } from "@/lib/database/profile";
import toast from "react-hot-toast";

export default function PersonalizationPage() {
  const [profile, setProfile] = useState<ProfileSettings>(DEFAULT_PROFILE);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const fetchedProfile = await fetchProfile();
        setProfile(fetchedProfile);
      } catch (error) {
        setMessageType("error");
setMessage(
  error instanceof Error ? error.message : "Could not load profile."
);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function updateProfile(field: keyof ProfileSettings, value: string) {
    setProfile((currentProfile) => ({
      ...currentProfile,
      [field]: value,
    }));
  }

  async function saveProfile() {
    try {
      setSaving(true);
      const updatedProfile = await upsertProfile(profile);
      setProfile(updatedProfile);
      setMessageType("success");
toast.success("Profile saved to Supabase.");
    } catch (error) {
      setMessageType("error");
toast.error(
  error instanceof Error ? error.message : "Could not save profile."
);
    } finally {
      setSaving(false);
    }
  }

  async function resetProfile() {
    try {
      setSaving(true);
      const updatedProfile = await upsertProfile(DEFAULT_PROFILE);
      setProfile(updatedProfile);
      setMessageType("success");
toast.success("Profile reset to default.");
    } catch (error) {
      setMessageType("error");
toast.error(
  error instanceof Error ? error.message : "Could not reset profile."
);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white pl-24 pr-8 py-10">
        <section className="mx-auto max-w-6xl">
          <p className="font-bold text-zinc-400">Loading profile settings...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white pl-24 pr-8 py-10">
      <section className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-cyan-400">
            Personalization
          </p>

          <h1 className="text-4xl font-black md:text-6xl">
            Customize LeadFlow
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-400">
            Control your sidebar profile, identity label, and brand feel.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
          <section className="rounded-3xl border border-cyan-400/20 bg-zinc-950 p-6">
            <div className="mb-6 flex items-center gap-3">
              <User className="h-6 w-6 text-cyan-400" />
              <div>
                <h2 className="text-2xl font-black">Sidebar Profile</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  These values control the profile block at the top of the
                  sidebar.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InputBox
                label="Display Name"
                value={profile.displayName}
                placeholder="Noah Pichardo"
                onChange={(value) => updateProfile("displayName", value)}
              />

              <InputBox
                label="Business Role"
                value={profile.role}
                placeholder="Founder / Lead Operator"
                onChange={(value) => updateProfile("role", value)}
              />

              <InputBox
                label="Profile Image Path"
                value={profile.profileImage}
                placeholder="/profile.jpeg"
                onChange={(value) => updateProfile("profileImage", value)}
              />

              <InputBox
                label="Brand Tagline"
                value={profile.tagline}
                placeholder="LeadFlow AI"
                onChange={(value) => updateProfile("tagline", value)}
              />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={saveProfile}
                disabled={saving}
                className="inline-flex flex-1 items-center justify-center gap-3 rounded-2xl bg-cyan-400 px-6 py-4 font-black text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-5 w-5" />
                {saving ? "Saving..." : "Save Profile"}
              </button>

              <button
                onClick={resetProfile}
                disabled={saving}
                className="inline-flex flex-1 items-center justify-center gap-3 rounded-2xl border border-zinc-800 bg-black px-6 py-4 font-black text-zinc-300 transition hover:border-cyan-400/40 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Reset Default
              </button>
            </div>
          </section>

          <aside className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <div className="mb-6 flex items-center gap-3">
              <Image className="h-6 w-6 text-cyan-400" />
              <h2 className="text-2xl font-black">Preview</h2>
            </div>

            <div className="rounded-3xl border border-cyan-400/20 bg-black p-5">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-full border border-cyan-400/30">
                  <img
                    src={profile.profileImage || DEFAULT_PROFILE.profileImage}
                    alt="Profile Preview"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xl font-black text-white">
                    {profile.displayName || "Display Name"}
                  </p>
                  <p className="truncate text-sm font-semibold text-cyan-400">
                    {profile.role || "Business Role"}
                  </p>
                </div>
              </div>

              <p className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm font-bold text-cyan-300">
                {profile.tagline || DEFAULT_PROFILE.tagline}
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-zinc-800 bg-black p-4">
              <p className="text-sm font-bold text-zinc-400">
                Image path example
              </p>
              <code className="mt-3 block rounded-xl bg-zinc-950 p-3 text-sm text-cyan-400">
                /profile.jpeg
              </code>
            </div>
          </aside>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <OptionCard icon={Palette} title="Accent Colors" text="Electric blue and neon green are currently active." />
          <OptionCard icon={Monitor} title="Display Mode" text="Dark mode is currently the main experience." />
          <OptionCard icon={Brush} title="Brand Style" text="Future controls can update spacing, borders, and visual density." />
        </div>
      </section>
    </main>
  );
}

function InputBox({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-zinc-400">
        {label}
      </span>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-700 focus:border-cyan-400"
      />
    </label>
  );
}

function OptionCard({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-400">
        <Icon className="h-6 w-6" />
      </div>
      <h2 className="text-xl font-black">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-zinc-500">{text}</p>
    </div>
  );
}