export type ArtCategory = 'all' | 'charcoal' | 'graphite' | 'ink' | 'pastel';

export interface Artwork {
  id: string;
  title: string;
  category: ArtCategory;
  medium: string;
  dimensions: string;
  year: string;
  imageUrl: string;
  description: string;
}

export type LessonLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Lesson {
  id: string;
  title: string;
  level: LessonLevel;
  duration: string;
  price: number;
  description: string;
  curriculum: string[];
}

export interface Testimonial {
  id: string;
  studentName: string;
  courseTaken: string;
  reviewText: string;
  rating: number;
  beforeImage: string; // URL to sketch showing beginner level
  afterImage: string;   // URL to sketch showing advanced level
}

export interface BookingState {
  studentName: string;
  studentEmail: string;
  selectedLessonId: string;
  preferredDate: string;
  preferredTime: string;
  experienceLevel: LessonLevel;
  message: string;
}

export interface StudentProject {
  id: string;
  title: string;
  studentName: string;
  durationInAcademy: string;
  level: LessonLevel;
  medium: string;
  imageUrl: string;
  description: string;
  teacherMentorshipNotes: string;
}

