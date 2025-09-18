/**
 * @file This file defines the main page for the "Courses" section of the dashboard.
 * It displays a list of all available courses and includes a button to add a new course.
 */
import { CourseCard } from "@/components/courses/course-card";
import { courses } from "@/lib/courses-data";
import { AddCourseForm } from "@/components/courses/add-course-form";

/**
 * The main component for the Courses page.
 * It fetches the list of courses and renders them as a grid of cards.
 * @returns A JSX element rendering the courses page.
 */
export default function CoursesPage() {
  return (
    <main className="flex flex-1 flex-col bg-transparent">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Course Management</h1>
          <p className="text-muted-foreground">
            Browse, add, and manage courses offered by your institution.
          </p>
        </div>
        {/* The "Add Course" button which opens a dialog form */}
        <AddCourseForm />
      </div>
      
      {/* Grid container for displaying course cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {courses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </main>
  );
}
