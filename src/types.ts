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

export interface SiteContent {
  hero: {
    badgeText: string;
    headingTextMain: string;
    headingTextHighlight: string;
    headingTextSuffix: string;
    subheadingText: string;
    ctaPrimaryText: string;
    ctaSecondaryText: string;
    teacherPhotoUrl?: string;
    underlayPhotoUrl?: string;
    sigQuote?: string;
    sigSub?: string;
  };
  about: {
    badgeText: string;
    title: string;
    paragraphs: string[];
    experienceYears: string;
    studentsMentored: string;
    quote?: string;
    avatarUrl?: string;
    authorName?: string;
    authorRole?: string;
  };
  contact?: {
    badgeText: string;
    title: string;
    description: string;
    phone: string;
    email: string;
    address: string;
    infoCardText: string;
    infoCardQuote: string;
    infoCardQuoteAuthor: string;
    metricLeftVal: string;
    metricLeftLabel: string;
    metricRightVal: string;
    metricRightLabel: string;
  };
  gallery: Artwork[];
  studentShowcase: StudentProject[];
  lessons: Lesson[];
  testimonials: Testimonial[];
  uploadedImages?: string[];
}


