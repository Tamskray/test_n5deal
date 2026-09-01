"use client";

import Link from "next/link";

import { RoleAccessNotice } from "@/components/RoleAccessNotice";
import { FormField, FormTextarea } from "@/components/FormFields";
import { useAuth } from "@/context/AuthContext";
import {
  validateBuyerProfile,
  isProfileValid,
  type BuyerValidationErrors,
} from "@/lib/buyerValidation";
import { useEffect, useState, type FormEvent } from "react";

type BuyerProfile = {
  contactName: string;
  companyName: string | null;
  investmentInterests: string | null;
};

type Message = {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: { email: string; buyer: { contactName: string } | null; seller: unknown };
  asset: {
    id: string;
    descriptionShort: string;
    country: string;
    typeOfLicense: string;
    company: { name: string } | null;
  } | null;
};

function MessageList({ messages, emptyText }: { messages: Message[]; emptyText: string }) {
  if (messages.length === 0) {
    return <p className="text-sm text-slate-500">{emptyText}</p>;
  }

  return (
    <div className="divide-y divide-slate-100">
      {messages.map((message) => (
        <article key={message.id} className="py-5 first:pt-0 last:pb-0">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-semibold text-slate-900">
              {message.sender.buyer?.contactName ?? message.sender.email}
            </h3>
            <time dateTime={message.createdAt} className="text-xs text-slate-500">
              {new Date(message.createdAt).toLocaleString()}
            </time>
          </div>
          {message.asset ? (
            <Link
              href={`/all-listing/${message.asset.id}`}
              className="mt-1 inline-flex text-xs font-semibold uppercase tracking-wide text-sky-600 transition hover:text-sky-800"
            >
              {message.asset.company?.name ?? message.asset.descriptionShort} ·{" "}
              {message.asset.typeOfLicense} · {message.asset.country}
            </Link>
          ) : null}
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
            {message.content}
          </p>
        </article>
      ))}
    </div>
  );
}

export default function BuyerDashboardPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const [profile, setProfile] = useState<BuyerProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [errors, setErrors] = useState<BuyerValidationErrors>({});

  useEffect(() => {
    if (!userId) {
      return;
    }

    let active = true;

    Promise.all([
      fetch(`/api/buyer/profile?userId=${encodeURIComponent(userId)}`).then((response) =>
        response.ok ? response.json() : null,
      ),
      fetch(`/api/messages?userId=${encodeURIComponent(userId)}`).then((response) =>
        response.ok ? response.json() : [],
      ),
    ]).then(([nextProfile, nextMessages]) => {
      if (!active) return;
      setProfile(nextProfile);
      setMessages(nextMessages);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [userId]);

  const updateProfile = (field: keyof BuyerProfile, value: string) => {
    setProfile((current) => ({
      contactName: current?.contactName ?? user?.name ?? "Buyer",
      companyName: current?.companyName ?? "",
      investmentInterests: current?.investmentInterests ?? "",
      [field]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile || !userId) return;

    // Validate profile before submission
    const formErrors = validateBuyerProfile(profile);
    if (!isProfileValid(formErrors)) {
      setErrors(formErrors);
      return;
    }

    setSaving(true);
    setNotice("");
    const response = await fetch("/api/buyer/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, ...profile }),
    });
    setSaving(false);
    setNotice(response.ok ? "Investment profile saved." : "Unable to save your profile.");
  };
  const sentMessages = messages.filter((message) => message.senderId === userId);
  const receivedMessages = messages.filter((message) => message.senderId !== userId);

  if (!user || user.role !== "BUYER") return <RoleAccessNotice requiredRole="BUYER" />;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Dashboard</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Buyer Dashboard</h1>
        <p className="mt-3 text-slate-600">
          Welcome back, {user.name}. Keep your acquisition brief current.
        </p>
      </div>

      {loading ? <p className="text-sm text-slate-500">Loading your buyer workspace...</p> : null}

      <section
        id="messages"
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">01</p>
          <h2 className="mt-2 text-xl font-bold text-slate-900">
            Investment Profile &amp; Interests
          </h2>
        </div>
        {profile ? (
          <form onSubmit={saveProfile} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                label="Contact name"
                name="contactName"
                value={profile.contactName}
                onChange={(value) => updateProfile("contactName", value)}
                error={errors.contactName}
                required
                placeholder="Your full name"
              />
              <FormField
                label="Company name"
                name="companyName"
                value={profile.companyName ?? ""}
                onChange={(value) => updateProfile("companyName", value)}
                error={errors.companyName}
                placeholder="Your company or firm name"
              />
            </div>
            <FormTextarea
              label="Investment interests"
              name="investmentInterests"
              value={profile.investmentInterests ?? ""}
              onChange={(value) => updateProfile("investmentInterests", value)}
              error={errors.investmentInterests}
              placeholder="Describe the types of assets and financial businesses you're interested in acquiring (minimum 10 characters)"
              rows={5}
            />
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={saving || Object.keys(errors).length > 0}
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save profile"}
              </button>
              {notice ? (
                <p role="status" className="text-sm font-medium text-emerald-700">
                  {notice}
                </p>
              ) : null}
            </div>
          </form>
        ) : (
          <p className="text-sm text-slate-500">Your buyer profile is not available yet.</p>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">02</p>
          <h2 className="mt-2 text-xl font-bold text-slate-900">My Inquiries &amp; Messages</h2>
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">Sent to sellers</h3>
              <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
                {sentMessages.length}
              </span>
            </div>
            <MessageList messages={sentMessages} emptyText="You have not sent any inquiries yet." />
          </div>
          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">Received from sellers</h3>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                {receivedMessages.length}
              </span>
            </div>
            <MessageList
              messages={receivedMessages}
              emptyText="No seller replies have arrived yet."
            />
          </div>
        </div>
      </section>
    </div>
  );
}
