import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Mail, Building2, User, Briefcase, CheckCircle2, Loader2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({
    meta: [
      { title: "Create your OptiX account" },
      {
        name: "description",
        content:
          "Register for OptiX. We'll email you a secure magic link to verify your address and sign you in.",
      },
    ],
  }),
});

const schema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(100),
  company: z.string().trim().min(1, "Company is required").max(120),
  role: z.string().trim().min(1, "Role is required").max(80),
  email: z.string().trim().email("Enter a valid email").max(255),
});

type FormState = z.infer<typeof schema>;

function RegisterPage() {
  const [form, setForm] = useState<FormState>({
    full_name: "",
    company: "",
    role: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const update = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please fix the form");
      return;
    }
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: parsed.data.email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: parsed.data.full_name,
            company: parsed.data.company,
            role: parsed.data.role,
          },
        },
      });
      if (authError) throw authError;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
          <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 text-2xl font-semibold">Check your inbox</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We sent a verification link to <span className="font-medium text-foreground">{form.email}</span>.
            Click it to confirm your email and finish creating your OptiX account.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            The link expires in 1 hour. Didn't get it? Check spam or{" "}
            <button
              type="button"
              className="underline"
              onClick={() => setSent(false)}
            >
              try again
            </button>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Create your OptiX account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            We'll send a magic link to verify your email.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Field
            id="full_name"
            label="Full name"
            icon={<User className="h-4 w-4" />}
            value={form.full_name}
            onChange={update("full_name")}
            placeholder="Jane Doe"
            autoComplete="name"
          />
          <Field
            id="company"
            label="Company"
            icon={<Building2 className="h-4 w-4" />}
            value={form.company}
            onChange={update("company")}
            placeholder="Acme Inc."
            autoComplete="organization"
          />
          <Field
            id="role"
            label="Role"
            icon={<Briefcase className="h-4 w-4" />}
            value={form.role}
            onChange={update("role")}
            placeholder="Product Manager"
            autoComplete="organization-title"
          />
          <Field
            id="email"
            label="Work email"
            icon={<Mail className="h-4 w-4" />}
            value={form.email}
            onChange={update("email")}
            placeholder="you@company.com"
            type="email"
            autoComplete="email"
          />

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending link...
              </>
            ) : (
              "Send verification link"
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Already have access?{" "}
            <Link to="/" className="underline">
              Back to home
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  icon,
  ...props
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
} & React.ComponentProps<"input">) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
        <Input id={id} className="pl-9" required {...props} />
      </div>
    </div>
  );
}
