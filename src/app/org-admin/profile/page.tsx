// app/org-admin/profile/page.tsx
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { Role } from "@/lib/auth/roles";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Edit,
  MapPin,
  Phone,
  Mail,
  Facebook,
  Building,
  Globe,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
    include: {
      courses: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
      users: {
        select: {
          id: true,
        },
      },
    },
  });
}

export default async function OrganizationProfilePage() {
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Organization Profile
          </h1>
          <p className="text-gray-600 mt-1">
            View and manage the information of your organization.
          </p>
        </div>
        <Link href={`/org-admin/profile/edit`}>
          <Button className="bg-gray-300 hover:bg-gray-500">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </Link>
      </div>

      {/* Organization Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            {/* Logo */}
            <div className="flex-shrink-0">
              {organization.logoImage ? (
                <div className="w-24 h-24 relative rounded-lg border bg-gray-50 overflow-hidden">
                  <Image
                    src={organization.logoImage}
                    alt={`${organization.name} logo`}
                    fill
                    className="object-contain p-2"
                    sizes="96px"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-lg border bg-gray-100 flex items-center justify-center">
                  <Building className="h-10 w-10 text-gray-400" />
                </div>
              )}
            </div>

            {/* Organization Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {organization.name}
                </h2>
              </div>
              <p className="text-gray-600 mb-4 max-w-2xl">
                {organization.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{organization.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{organization.email}</p>
              </div>
            </div>

            {organization.facebookPage && (
              <div className="flex items-center gap-3">
                <Facebook className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Facebook Page</p>
                  <a
                    href={organization.facebookPage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:text-blue-800"
                  >
                    Visit Page
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(organization.province || organization.district) && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Province & District</p>
                  <p className="font-medium">
                    {[organization.district, organization.province]
                      .filter(Boolean)
                      .join(", ") || "Not specified"}
                  </p>
                </div>
              </div>
            )}

            {organization.address && (
              <div className="flex items-start gap-3">
                <Globe className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{organization.address}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Coordinates</p>
                <p className="font-medium">
                  {organization.latitude}, {organization.longitude}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
