"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, Mail, Trash2, MoreVertical, AlertTriangle, Shield, Users } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/context/ToastContext";
import { Role, UserStatus, InvitationStatus } from "@/lib/auth/roles";

type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  organizationId?: string;
  organization?: {
    name: string;
  };
  lastLoginAt?: string;
  createdAt: string;
};

type UserInvitation = {
  id: string;
  email: string;
  role: Role;
  status: InvitationStatus;
  organizationId?: string;
  organization?: {
    name: string;
  };
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  notes?: string;
};

type Organization = {
  id: string;
  name: string;
};

export default function UserManagementPage() {
  const { data: _session } = useSession();
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<UserInvitation[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: Role.YOUTH_ADVOCATE,
    organizationId: "",
    notes: "",
  });

  // Fetch data
  useEffect(() => {
    Promise.all([
      fetchUsers(),
      fetchInvitations(),
      fetchOrganizations(),
    ]).finally(() => setLoading(false));
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchInvitations = async () => {
    try {
      const response = await fetch("/api/admin/invitations");
      if (response.ok) {
        const data = await response.json();
        setInvitations(data);
      }
    } catch (error) {
      console.error("Error fetching invitations:", error);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const response = await fetch("/api/admin/organizations");
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data);
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
    }
  };

  const handleSendInvitation = async () => {
    try {
      // Convert "none" to null for organizationId
      const formData = {
        ...inviteForm,
        organizationId: inviteForm.organizationId === "none" ? null : inviteForm.organizationId,
      };
      
      const response = await fetch("/api/admin/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showToast("Invitation sent successfully!", "", "success");
        setIsInviteDialogOpen(false);
        setInviteForm({
          email: "",
          role: Role.YOUTH_ADVOCATE,
          organizationId: "",
          notes: "",
        });
        fetchInvitations();
      } else {
        const error = await response.json();
        showToast("Failed to send invitation", error.message || "Please try again", "error");
      }
    } catch (_error) {
      showToast("Failed to send invitation", "Please try again", "error");
    }
  };

  const handleUpdateUserStatus = async (userId: string, status: UserStatus) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        showToast("User status updated successfully!", "", "success");
        fetchUsers();
      } else {
        showToast("Failed to update user status", "Please try again", "error");
      }
    } catch (_error) {
      showToast("Failed to update user status", "Please try again", "error");
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/admin/invitations/${invitationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showToast("Invitation revoked successfully!", "", "success");
        fetchInvitations();
      } else {
        showToast("Failed to revoke invitation", "Please try again", "error");
      }
    } catch (_error) {
      showToast("Failed to revoke invitation", "Please try again", "error");
    }
  };

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case Role.PLATFORM_ADMIN:
        return "bg-red-100 text-red-800 border-red-200";
      case Role.ORGANIZATION_ADMIN:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case Role.YOUTH_ADVOCATE:
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusBadgeColor = (status: UserStatus | InvitationStatus) => {
    switch (status) {
      case UserStatus.ACTIVE:
      case InvitationStatus.ACCEPTED:
        return "bg-green-100 text-green-800 border-green-200";
      case UserStatus.INACTIVE:
        return "bg-gray-100 text-gray-800 border-gray-200";
      case UserStatus.SUSPENDED:
        return "bg-red-100 text-red-800 border-red-200";
      case InvitationStatus.PENDING:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case InvitationStatus.EXPIRED:
      case InvitationStatus.REVOKED:
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-16 w-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage Youth Advocates and user access to the platform
          </p>
        </div>
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
              <DialogDescription>
                Send an invitation to add a new Youth Advocate to the platform.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  value={inviteForm.role}
                  onValueChange={(value) => setInviteForm({ ...inviteForm, role: value as Role })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Role.YOUTH_ADVOCATE}>Youth Advocate</SelectItem>
                    <SelectItem value={Role.ORGANIZATION_ADMIN}>Organization Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="organization">Organization (Optional)</Label>
                <Select
                  value={inviteForm.organizationId}
                  onValueChange={(value) => setInviteForm({ ...inviteForm, organizationId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No organization</SelectItem>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={inviteForm.notes}
                  onChange={(e) => setInviteForm({ ...inviteForm, notes: e.target.value })}
                  placeholder="Additional notes about this invitation..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendInvitation}>Send Invitation</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Youth Advocates</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.role === Role.YOUTH_ADVOCATE).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invitations</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invitations.filter((inv) => inv.status === InvitationStatus.PENDING).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage existing users and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No users found</p>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">{user.name}</h3>
                      <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                      <Badge className={getStatusBadgeColor(user.status)}>{user.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    {user.organization && (
                      <p className="text-sm text-muted-foreground">
                        Organization: {user.organization.name}
                      </p>
                    )}
                    {user.lastLoginAt && (
                      <p className="text-xs text-muted-foreground">
                        Last login: {new Date(user.lastLoginAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {user.status === UserStatus.ACTIVE && (
                        <DropdownMenuItem
                          onClick={() => handleUpdateUserStatus(user.id, UserStatus.SUSPENDED)}
                          className="text-orange-600"
                        >
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Suspend User
                        </DropdownMenuItem>
                      )}
                      {user.status === UserStatus.SUSPENDED && (
                        <DropdownMenuItem
                          onClick={() => handleUpdateUserStatus(user.id, UserStatus.ACTIVE)}
                          className="text-green-600"
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Activate User
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invitations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations</CardTitle>
          <CardDescription>
            Manage pending invitations and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invitations.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No pending invitations</p>
            ) : (
              invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">{invitation.email}</h3>
                      <Badge className={getRoleBadgeColor(invitation.role)}>
                        {invitation.role}
                      </Badge>
                      <Badge className={getStatusBadgeColor(invitation.status)}>
                        {invitation.status}
                      </Badge>
                    </div>
                    {invitation.organization && (
                      <p className="text-sm text-muted-foreground">
                        Organization: {invitation.organization.name}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Invited: {new Date(invitation.invitedAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Expires: {new Date(invitation.expiresAt).toLocaleDateString()}
                    </p>
                    {invitation.notes && (
                      <p className="text-sm text-muted-foreground mt-1">{invitation.notes}</p>
                    )}
                  </div>
                  {invitation.status === InvitationStatus.PENDING && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeInvitation(invitation.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}