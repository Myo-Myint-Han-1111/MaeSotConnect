"use client";

import React, { useEffect, useState, useMemo } from "react";
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
  durationUnit?: string;
  durationMm?: number;
  durationUnitMm?: string;
  images: string[];
  badges: {
    text: string;
    color: string;
    backgroundColor: string;
  }[];
}

const formatDuration = (duration: number, unit: string = "DAYS"): string => {
  if (!duration) return "";

  const unitLabels: { [key: string]: { single: string; plural: string } } = {
    DAYS: { single: "day", plural: "days" },
    WEEKS: { single: "week", plural: "weeks" },
    MONTHS: { single: "month", plural: "months" },
    YEARS: { single: "year", plural: "years" },
  };

  const label = unitLabels[unit] || unitLabels.DAYS;
  return `${duration} ${duration === 1 ? label.single : label.plural}`;
};

interface Organization {
  id: string;
  name: string;
}

export default function CoursesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);

  // NEW: Status filter for admin dashboard
  const [statusFilter, setStatusFilter] = useState<string>("all");

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

  // NEW: Get course status function for admin dashboard
  const getCourseStatus = (course: Course) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(course.startDate);
    const endDate = course.endDate ? new Date(course.endDate) : null;

    if (endDate && endDate < today) {
      return "ended";
    }

    if (startDate < today) {
      return "started";
    }

    return "upcoming";
  };

  // NEW: Get course counts by status for admin dashboard
  const courseCounts = useMemo(() => {
    const counts = {
      total: courses.length,
      upcoming: 0,
      started: 0,
      ended: 0,
    };

    courses.forEach((course) => {
      const status = getCourseStatus(course);
      if (status === "upcoming") counts.upcoming++;
      else if (status === "started") counts.started++;
      else if (status === "ended") counts.ended++;
    });

    return counts;
  }, [courses]);

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
        const coursesResponse = await fetch("/api/courses", {
          cache: "no-store",
        });
        if (!coursesResponse.ok) {
          throw new Error("Failed to fetch courses");
        }
        const coursesData = await coursesResponse.json();

        // Fetch organizations for display
        const orgsResponse = await fetch("/api/organizations", {
          cache: "no-store",
        });
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

  // MODIFIED: Filter courses - NO DATE FILTERING for admin dashboard
  const filteredCourses = useMemo(() => {
    let filtered = courses.filter(
      (course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.organization?.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((course) => {
        const status = getCourseStatus(course);
        return status === statusFilter;
      });
    }

    return filtered;
  }, [courses, searchTerm, statusFilter]);

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
        <div>
          <h1 className="text-3xl font-bold">Manage Courses</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              Admin View
            </span>
            <span className="text-sm text-muted-foreground">
              All courses visible for management
            </span>
          </div>
        </div>
        <Link href="/dashboard/courses/new">
          <Button className="bg-blue-700 hover:bg-blue-600 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add New Course
          </Button>
        </Link>
      </div>

      {/* NEW: Course Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border text-center">
          <div className="text-2xl font-bold text-blue-600">
            {courseCounts.total}
          </div>
          <div className="text-sm text-muted-foreground">Total Courses</div>
        </div>
        <div className="bg-white p-4 rounded-lg border text-center">
          <div className="text-2xl font-bold text-green-600">
            {courseCounts.upcoming}
          </div>
          <div className="text-sm text-muted-foreground">Upcoming</div>
          <div className="text-xs text-green-600 mt-1">
            ✅ Visible to public
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {courseCounts.started}
          </div>
          <div className="text-sm text-muted-foreground">Started</div>
          <div className="text-xs text-red-600 mt-1">❌ Hidden from public</div>
        </div>
        <div className="bg-white p-4 rounded-lg border text-center">
          <div className="text-2xl font-bold text-red-600">
            {courseCounts.ended}
          </div>
          <div className="text-sm text-muted-foreground">Ended</div>
          <div className="text-xs text-red-600 mt-1">❌ Hidden from public</div>
        </div>
      </div>

      {/* NEW: Status Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("all")}
          className={
            statusFilter === "all"
              ? "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300"
              : ""
          }
        >
          All Courses ({courseCounts.total})
        </Button>
        <Button
          variant={statusFilter === "upcoming" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("upcoming")}
          className={
            statusFilter === "upcoming"
              ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-300"
              : ""
          }
        >
          Upcoming ({courseCounts.upcoming})
        </Button>
        <Button
          variant={statusFilter === "started" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("started")}
          className={
            statusFilter === "started"
              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300"
              : ""
          }
        >
          Started ({courseCounts.started})
        </Button>
        <Button
          variant={statusFilter === "ended" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("ended")}
          className={
            statusFilter === "ended"
              ? "bg-red-100 text-red-800 hover:bg-red-200 border-red-300"
              : ""
          }
        >
          Ended ({courseCounts.ended})
        </Button>
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
            {searchTerm || statusFilter !== "all"
              ? "No courses match your search criteria or selected filter. Try different keywords or clear filters."
              : "You haven't created any courses yet. Get started by adding your first course."}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <Link href="/dashboard/courses/new">
              <Button className="bg-blue-700 hover:bg-blue-600 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add New Course
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const status = getCourseStatus(course);

            return (
              <Card
                key={course.id}
                className="overflow-hidden relative bg-white"
              >
                {/* NEW: Status Badge */}
                <div className="absolute top-2 right-2 z-10">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      status === "upcoming"
                        ? "bg-green-100 text-green-800"
                        : status === "started"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>

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

                  {/* Updated date display section with status indicators */}
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
                    {course.duration && course.durationUnit && (
                      <p>
                        <strong>Duration:</strong>{" "}
                        {formatDuration(course.duration, course.durationUnit)}
                      </p>
                    )}
                  </div>

                  {/* NEW: Public Visibility Indicator */}
                  <div className="mt-3 pt-3 border-t">
                    {status === "upcoming" ? (
                      <div className="flex items-center text-sm text-green-600">
                        <span className="mr-2">✅</span>
                        <span className="font-medium">Visible to public</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-sm text-red-600">
                        <span className="mr-2">❌</span>
                        <span className="font-medium">Hidden from public</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          (
                          {status === "started"
                            ? "Course has started"
                            : "Course has ended"}
                          )
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="flex justify-between border-t p-4 bg-gray-50">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-gray-100"
                    onClick={() => router.push(`/courses/${course.id}`)}
                  >
                    View Public
                  </Button>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-blue-600 hover:text-white"
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
                      className="hover:text-gray-500"
                      onClick={() => confirmDeleteCourse(course.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
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
