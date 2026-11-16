"use client";

import { useParams } from "next/navigation";
import { CourseEditor } from "../../_components/course-editor";
import { useCourse } from "../../_hooks/use-courses";

export default function EditCoursePage() {
  const params = useParams<{ id: string }>();
  const courseId = params.id;
  const { data: course, isLoading, error } = useCourse(courseId);

  if (isLoading) {
    return <div className="text-muted-foreground">Loading course...</div>;
  }

  if (error || !course) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">Course not found.</p>
      </div>
    );
  }

  // Key on id so curriculum draft state resets only when switching courses.
  return <CourseEditor key={course.id} course={course} />;
}
