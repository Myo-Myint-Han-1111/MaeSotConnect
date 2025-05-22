"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  BookOpen,
  Building2,
} from "lucide-react";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";

interface Course {
  id: string;
  title: string;
  subtitle: string;
  organization?: {
    name: string;
  };
  organizationId: string;
  startDate: string;
  endDate?: string;
  duration?: number;
  images: string[];
  badges: {
    text: string;
    color: string;
    backgroundColor: string;
  }[];
}

interface Organization {
  id: string;
  name: string;
}

export default function CoursesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);

  // Change the function to display full year:
  const formatDateToDDMMYYYY = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }

      const year = date.getFullYear().toString(); // Full year, no slicing
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");

      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Only platform admins can access this page
  useEffect(() => {
    if (session && session.user.role !== "PLATFORM_ADMIN") {
      router.push("/auth/signin");
    }
  }, [session, router]);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all courses
        const coursesResponse = await fetch("/api/courses");
        if (!coursesResponse.ok) {
          throw new Error("Failed to fetch courses");
        }
        const coursesData = await coursesResponse.json();

        // Fetch organizations for display
        const orgsResponse = await fetch("/api/organizations");
        if (!orgsResponse.ok) {
          throw new Error("Failed to fetch organizations");
        }
        const orgsData = await orgsResponse.json();

        // Add organization name to each course
        const coursesWithOrgs = coursesData.map((course: Course) => {
          const org = orgsData.find(
            (o: Organization) => o.id === course.organizationId
          );
          return {
            ...course,
            organization: org ? { name: org.name } : undefined,
          };
        });

        setCourses(coursesWithOrgs);
        setOrganizations(orgsData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }

    if (session && session.user.role === "PLATFORM_ADMIN") {
      fetchData();
    }
  }, [session]);

  const confirmDeleteCourse = (id: string) => {
    setCourseToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;

    try {
      const response = await fetch(`/api/courses/${courseToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete course");
      }

      // Remove from local state
      setCourses(courses.filter((course) => course.id !== courseToDelete));
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting course:", error);
      setError("Failed to delete course. Please try again.");
    }
  };

  // Filter courses based on search term
  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.organization?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Manage Courses</h1>
        <Link href="/dashboard/courses/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Course
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses by title, subtitle, or organization"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-md bg-red-50 text-red-500">
          {error}
        </div>
      )}

      {filteredCourses.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Courses Found</h2>
          <p className="text-muted-foreground mb-6">
            {searchTerm
              ? "No courses match your search criteria. Try different keywords."
              : "You haven't created any courses yet. Get started by adding your first course."}
          </p>
          {!searchTerm && (
            <Link href="/dashboard/courses/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add New Course
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <div className="h-40 relative">
                {course.images && course.images.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={course.images[0]}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <BookOpen className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
              </div>

              <CardHeader className="pb-2">
                <h3 className="text-xl font-semibold">{course.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {course.subtitle}
                </p>
              </CardHeader>

              <CardContent className="pb-4">
                {/* Display organization info */}
                {course.organization && (
                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <Building2 className="h-4 w-4 mr-1" />
                    <span>{course.organization.name}</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mb-3">
                  {course.badges.map((badge, i) => (
                    <span
                      key={i}
                      className="inline-block px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: badge.backgroundColor,
                        color: badge.color,
                      }}
                    >
                      {badge.text}
                    </span>
                  ))}
                </div>

                {/* Updated date display section with YY/MM/DD format */}
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Start:</strong>{" "}
                    {formatDateToDDMMYYYY(course.startDate)}
                  </p>
                  {course.endDate && (
                    <p>
                      <strong>End:</strong>{" "}
                      {formatDateToDDMMYYYY(course.endDate)}
                    </p>
                  )}
                  {course.duration && (
                    <p>
                      <strong>Duration:</strong> {course.duration} days
                    </p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex justify-between border-t p-4 bg-gray-50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/courses/${course.id}`)}
                >
                  View Public
                </Button>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/dashboard/courses/${course.id}/edit`)
                    }
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => confirmDeleteCourse(course.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteCourse}
        title="Delete Course"
        description="Are you sure you want to delete this course? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}
