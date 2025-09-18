/**
 * @file This file contains the mock data and data management functions for courses.
 * In a real application, this would be replaced with API calls to a database.
 */
import { Course } from "./types";
import { PlaceHolderImages } from "./placeholder-images";

// Initial array of course data. This acts as our in-memory "database table" for courses.
export let courses: Course[] = [
    {
        id: "COURSE-001",
        title: "Full Stack Web Development",
        description: "Master front-end and back-end technologies to build complete web applications. Covers HTML, CSS, JavaScript, React, Node.js, and databases.",
        duration: "6 Months",
        fees: 75000,
        instructor: "Rohan Mehta",
        imageUrl: "course-1",
    },
    {
        id: "COURSE-002",
        title: "Data Science & Machine Learning",
        description: "Dive into data analysis, visualization, and machine learning algorithms. Learn Python, Pandas, Scikit-learn, and TensorFlow.",
        duration: "8 Months",
        fees: 90000,
        instructor: "Priya Sharma",
        imageUrl: "course-2",
    },
    {
        id: "COURSE-003",
        title: "Digital Marketing Pro",
        description: "Learn SEO, SEM, social media marketing, and content strategy to drive business growth online. Includes Google Analytics and Ads.",
        duration: "4 Months",
        fees: 45000,
        instructor: "Aditya Verma",
        imageUrl: "course-3",
    },
    {
        id: "COURSE-004",
        title: "Cyber Security Essentials",
        description: "Understand the fundamentals of network security, ethical hacking, and cryptography to protect digital assets from threats.",
        duration: "5 Months",
        fees: 60000,
        instructor: "Sneha Reddy",
        imageUrl: "course-4",
    },
    {
        id: "COURSE-005",
        title: "Cloud Computing with AWS",
        description: "Gain expertise in cloud infrastructure and services using Amazon Web Services. Covers EC2, S3, RDS, and Lambda.",
        duration: "5 Months",
        fees: 65000,
        instructor: "Vikram Singh",
        imageUrl: "course-5",
    },
    {
        id: "COURSE-006",
        title: "UI/UX Design Fundamentals",
        description: "Master the principles of user-centric design, wireframing, prototyping, and user testing with tools like Figma and Adobe XD.",
        duration: "3 Months",
        fees: 40000,
        instructor: "Anjali Rao",
        imageUrl: "course-6",
    }
];

/**
 * Adds a new course to the in-memory store. In a real application, this function
 * would make a POST request to a backend API to create a new course in the database.
 * @param course - The course data to add, without the 'id' and 'imageUrl' which are auto-generated.
 * @returns The newly created course object with an assigned ID and imageUrl.
 */
export function addCourse(course: Omit<Course, 'id' | 'imageUrl'>): Course {
    // Generate a new unique ID for the course.
    const newId = `COURSE-${String(courses.length + 1).padStart(3, '0')}`;
    const imageId = `course-${courses.length + 1}`;
    
    // Create the full course object.
    const newCourse: Course = {
        ...course,
        id: newId,
        imageUrl: imageId,
    };
    // Add the new course to the in-memory array.
    courses.push(newCourse);

    // Also add a corresponding placeholder image for the new course.
    // This ensures that new courses have an image displayed on the UI.
    PlaceHolderImages.push({
        id: imageId,
        description: `${course.title} Course Image`,
        imageUrl: `https://picsum.photos/seed/${imageId}/600/400`,
        imageHint: "course image"
    })

    return newCourse;
}
