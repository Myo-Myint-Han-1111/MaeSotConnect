// app/org-admin/profile/edit/page.tsx
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { Role } from "@/lib/auth/roles";
import { redirect } from "next/navigation";
import OrganizationProfileForm from "@/components/org-admin/OrganizationProfileForm";

interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  organizationId?: string | null;
}

async function getOrganization(organizationId: string) {
  return await prisma.organization.findUnique({
    where: { id: organizationId },
  });
}

export default async function EditOrganizationProfilePage() {
  const session = await auth();

  if (!session || session.user.role !== Role.ORGANIZATION_ADMIN) {
    redirect("/auth/signin");
  }

  const user = session.user as SessionUser;

  if (!user.organizationId) {
    redirect("/auth/signin");
  }

  const organization = await getOrganization(user.organizationId);

  if (!organization) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Organization Not Found</h2>
        <p className="text-muted-foreground">
          Your organization details could not be found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Edit Organization Profile
        </h1>
        <p className="text-gray-600 mt-1">
          Update the public information and settings of your organization.
        </p>
      </div>

      <OrganizationProfileForm organization={organization} />
    </div>
  );
}
