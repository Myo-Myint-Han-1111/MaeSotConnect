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
import { Pencil, Trash2, Plus, Search, BookOpen } from "lucide-react";

interface Course {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  startDate: string;
  organizationId: string;
  images: string[];
  badges: {
    text: string;
    color: string;
    backgroundColor: string;
  }[];
}

export default function CoursesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isPlatformAdmin = session?.user?.role === "PLATFORM_ADMIN";

  useEffect(() => {
    async function fetchCourses() {
      try {
        // Get all courses or filtered by organization
        const url = isPlatformAdmin
          ? "/api/courses"
          : `/api/organizations/${session?.user?.organizationId}/courses`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }
        const data = await response.json();
        setCourses(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
        console.error("Error fetching courses:", err);
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      fetchCourses();
    }
  }, [session, isPlatformAdmin]);

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) {
      return;
    }

    try {
      const response = await fetch(`/api/courses/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete course");
      }

      // Remove from local state
      setCourses(courses.filter((course) => course.id !== id));
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Failed to delete course");
    }
  };

  // Filter courses based on search term
  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.location.toLowerCase().includes(searchTerm.toLowerCase())
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
            placeholder="Search courses by title, subtitle, or location"
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

                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Location:</strong> {course.location}
                  </p>
                  <p>
                    <strong>Start Date:</strong> {course.startDate}
                  </p>
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
                    onClick={() => handleDeleteCourse(course.id)}
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
    </div>
  );
}
