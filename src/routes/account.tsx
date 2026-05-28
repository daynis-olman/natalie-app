import { createFileRoute } from "@tanstack/react-router";
import { User, Mail, Briefcase, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account — Natalie's Compass" },
      { name: "description", content: "Manage your account profile and preferences." },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const user = {
    name: "Daynis Olman",
    email: "daynis.olman@company.com",
    role: "Change Portfolio Lead",
    initials: "DO",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My Account</h1>
        <p className="text-sm text-muted-foreground mt-1">Profile and session details.</p>
      </div>

      <Card className="p-6">
        <div className="flex items-start gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent/60 text-white text-xl font-semibold shadow-sm">
            {user.initials}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.role}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 border-t border-border pt-6">
          <Field icon={User} label="Full name" value={user.name} />
          <Field icon={Mail} label="Email" value={user.email} />
          <Field icon={Briefcase} label="Role" value={user.role} />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold">Session</h3>
        <p className="text-sm text-muted-foreground mt-1">Sign out of Natalie's Compass on this device.</p>
        <Button variant="outline" className="mt-4 gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </Card>
    </div>
  );
}

function Field({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}
