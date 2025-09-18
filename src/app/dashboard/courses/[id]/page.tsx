/**
 * @file This file defines the page for displaying the detailed view of a single course.
 * It fetches the specific course data based on the ID from the URL and renders its details.
 */
import { courses } from "@/lib/courses-data";
import { notFound } from "next/navigation";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, IndianRupee, User, BookOpen, ChevronLeft } from "lucide-react";
import Link from "next/link";

// A helper function to get the placeholder image URL for a given ID.
const getImage = (id: string) => PlaceHolderImages.find((img) => img.id === id)?.imageUrl || "";

/**
 * The CourseDetailPage component.
 * This is a React Server Component that fetches and displays data for a single course.
 * @param params - The route parameters, containing the course `id`.
 * @returns A JSX element rendering the course details page.
 */
export default function CourseDetailPage({ params }: { params: { id: string } }) {
  // Find the course from the mock data source using the ID from the URL.
  const course = courses.find((c) => c.id === params.id);

  // If the course is not found, display the 404 Not Found page.
  if (!course) {
    notFound();
  }

  return (
    <main className="flex flex-1 flex-col bg-transparent">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/dashboard/courses" className="flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back to Courses
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-auto gap-6">
        <div className="md:col-span-3">
             <Card className="overflow-hidden">
                <div className="relative h-56 md:h-72 w-full">
                    {/* Course Hero Image */}
                    <Image
                        src={getImage(course.imageUrl)}
                        alt={course.title}
                        fill
                        className="object-cover"
                        data-ai-hint="course image"
                    />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                     <div className="absolute bottom-0 left-0 p-6">
                         <h1 className="text-4xl font-bold text-white tracking-tight">{course.title}</h1>
                         <p className="text-lg text-white/90 mt-1 max-w-prose">{course.description}</p>
                     </div>
                </div>
            </Card>
        </div>
        
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle>Syllabus & Learning Objectives</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Syllabus Section */}
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Master front-end technologies like HTML, CSS, JavaScript and React.</li>
                    <li>Build robust back-end applications with Node.js and Express.</li>
                    <li>Understand database design and management with MongoDB.</li>
                    <li>Deploy full-stack applications to cloud platforms.</li>
                    <li>Learn to work with APIs and integrate third-party services.</li>
                </ul>
            </CardContent>
        </Card>
        
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Course Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Duration:</span>
                        <span className="ml-auto text-foreground">{course.duration}</span>
                    </div>
                    <div className="flex items-center">
                        <IndianRupee className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Fees:</span>
                        <span className="ml-auto font-semibold text-xl text-foreground">₹{course.fees.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Category:</span>
                        <span className="ml-auto"><Badge variant="secondary">Technology</Badge></span>
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>About the Instructor</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                         <div className="relative h-16 w-16">
                            <Image
                                src="https://picsum.photos/seed/instructor1/80/80"
                                alt={course.instructor}
                                fill
                                className="object-cover rounded-full"
                                data-ai-hint="person avatar"
                            />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">{course.instructor}</h3>
                            <p className="text-sm text-muted-foreground">10+ years of experience in web development.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        <Card className="md:col-span-3">
             <CardContent className="p-6">
                <Button size="lg" className="w-full text-lg">Enroll Now</Button>
            </CardContent>
        </Card>
      </div>
    </main>
  );
}
