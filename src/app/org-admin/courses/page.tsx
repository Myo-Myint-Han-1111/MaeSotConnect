"use client";

// app/org-admin/courses/page.tsx
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  BookOpen,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  titleMm?: string;
  subtitle: string;
  subtitleMm?: string;
  startDate: string;
  endDate: string;
  duration: string;
  schedule: string;
  feeAmount: string;
  province?: string;
  district?: string;
  address?: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  images: Array<{ id: string; url: string }>;
  badges: Array<{
    id: string;
    text: string;
    color: string;
    backgroundColor: string;
  }>;
  organization?: {
    name: string;
    slug: string;
  };
}

export default function OrgAdminCoursesPage() {
  const { data: _session } = useSession(); // Prefix with underscore to avoid unused variable warning
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/org-admin/courses");

      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }

      const data = await response.json();
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-16 w-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Error</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={fetchCourses} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-600 mt-1">
            Manage your organization&apos;s courses
          </p>
        </div>
        <Link href="/org-admin/courses/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New Course
          </Button>
        </Link>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
            <p className="text-gray-600 mb-4">
              Get started by creating your first course for your organization.
            </p>
            <Link href="/org-admin/courses/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create New Course
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">
                      {course.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {course.subtitle}
                    </p>
                  </div>
                  <Link href={`/org-admin/courses/${course.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Date */}
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    {new Date(course.startDate).toLocaleDateString()} -{" "}
                    {new Date(course.endDate).toLocaleDateString()}
                  </span>
                </div>

                {/* Duration */}
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>
                    {course.duration} days • {course.schedule}
                  </span>
                </div>

                {/* Location */}
                {(course.district || course.province) && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>
                      {[course.district, course.province]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                )}

                {/* Fee */}
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 mr-2" />
                  <span>
                    {course.feeAmount === "0" ? "Free" : `$${course.feeAmount}`}
                  </span>
                </div>

                {/* Badges */}
                {course.badges.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {course.badges.slice(0, 3).map((badge, index) => (
                      <Badge
                        key={index}
                        className="text-xs"
                        style={{
                          backgroundColor: badge.backgroundColor,
                          color: badge.color,
                        }}
                      >
                        {badge.text}
                      </Badge>
                    ))}
                    {course.badges.length > 3 && (
                      <Badge className="text-xs border">
                        +{course.badges.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 border-t">
                  <div className="flex gap-2">
                    <Link href={`/courses/${course.slug}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        View Course
                      </Button>
                    </Link>
                    <Link
                      href={`/org-admin/courses/${course.id}/edit`}
                      className="flex-1"
                    >
                      <Button size="sm" className="w-full">
                        Edit Course
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
