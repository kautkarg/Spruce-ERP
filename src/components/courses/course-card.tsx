/**
 * @file This component represents a single course card, displaying key information
 * like title, description, duration, fees, and instructor.
 */
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Course } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import { IndianRupee, Clock } from "lucide-react";
import Link from "next/link";

// Helper function to get the placeholder image URL for a course.
const getImage = (id: string) => PlaceHolderImages.find((img) => img.id === id)?.imageUrl || "";

/**
 * CourseCard component.
 * @param {object} props - The component props.
 * @param {Course} props.course - The course data to display.
 * @returns A JSX element rendering a single course card.
 */
export function CourseCard({ course }: { course: Course }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          {/* Course Image */}
          <Image
            src={getImage(course.imageUrl)}
            alt={course.title}
            fill
            className="object-cover"
            data-ai-hint="course image"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
        <p className="text-sm text-muted-foreground mb-4 h-20 overflow-hidden">
          {course.description}
        </p>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center text-sm">
            <Clock className="w-4 h-4 mr-1.5 text-muted-foreground" />
            <span className="font-medium">{course.duration}</span>
          </div>
          <div className="flex items-center text-sm">
            <IndianRupee className="w-4 h-4 mr-1 text-muted-foreground" />
            <span className="font-semibold text-lg">{course.fees.toLocaleString()}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Instructor: <span className="font-medium text-foreground">{course.instructor}</span>
        </p>
        {/* Action Buttons */}
        <div className="flex gap-2">
            <Button variant="outline" className="w-full" asChild>
                <Link href={`/dashboard/courses/${course.id}`}>View Details</Link>
            </Button>
            <Button className="w-full">Enroll Now</Button>
        </div>
      </CardContent>
    </Card>
  );
}
