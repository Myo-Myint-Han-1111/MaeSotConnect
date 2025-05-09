// // src/data/courses.ts
// import { createBadge } from "@/components/Badges/BadgeSystem";

// export interface Course {
//   id: string;
//   images: string[];
//   title: string;
//   subtitle: string;
//   badges: {
//     text: string;
//     color: string;
//     backgroundColor: string;
//   }[];
//   location: string;
//   startDate: string;
//   duration: string;
//   schedule: string;
//   fee?: string;
//   availableDays: boolean[];
//   description?: string;
//   outcomes?: string[];
//   scheduleDetails?: string;
//   selectionCriteria?: string[];
//   faq?: {
//     question: string;
//     answer: string;
//   }[];
//   organizationInfo?: {
//     name: string;
//     description: string;
//     phone: string;
//     email: string;
//     address: string;
//     facebookPage?: string;
//     mapLocation: {
//       lat: number;
//       lng: number;
//     };
//   };
// }

// // Sample data - I'm just including one course for brevity
// export const courseData: Course[] = [
//   {
//     id: "1",
//     images: [
//       "/images/courses/C1.jpg",
//       "/images/courses/C2.jpg",
//       "/images/courses/C3.jpg",
//     ],
//     title: "Thai Language Course",
//     subtitle: "Youth Learning Center",
//     badges: [
//       createBadge("Language"),
//       createBadge("In-Person"),
//       createBadge("Beginner"),
//     ],
//     location: "Mae Sot, Thailand",
//     startDate: "January 15, 2025",
//     duration: "3 months",
//     schedule: "Mon, Wed, Fri: 2:00 PM - 4:00 PM",
//     availableDays: [false, true, false, true, false, true, false],
//     description:
//       "This comprehensive Thai language course is designed for beginners and intermediate learners living in Mae Sot.",
//     outcomes: [
//       "Develop conversational Thai skills for daily interactions",
//       "Learn to read and write basic Thai script",
//     ],
//     scheduleDetails:
//       "Classes run three days per week (Monday, Wednesday, and Friday) from 2:00 PM to 4:00 PM.",
//     selectionCriteria: [
//       "Open to all residents of Mae Sot area aged 15 and above",
//       "No prior Thai language knowledge required for beginners class",
//     ],
//     faq: [
//       {
//         question: "Do I need to bring any materials to class?",
//         answer: "All essential learning materials will be provided.",
//       },
//     ],
//     organizationInfo: {
//       name: "Youth Learning Center",
//       description:
//         "The Youth Learning Center is a community-based educational institution in Mae Sot.",
//       phone: "+66 55 123 4567",
//       email: "info@youthlearningcenter.org",
//       address: "123 Main Road, Mae Sot, Tak Province 63110, Thailand",
//       facebookPage: "https://facebook.com/youthlearningcenter",
//       mapLocation: {
//         lat: 16.7167,
//         lng: 98.5714,
//       },
//     },
//   },

//   {
//     id: "2",
//     images: [
//       "/images/courses/C4.jpg",
//       "/images/courses/C5.jpg",
//       "/images/courses/C6.jpg",
//     ],
//     title: "Thai Language Course",
//     subtitle: "Youth Learning Center",
//     badges: [
//       createBadge("Language"),
//       createBadge("Vocational"),
//       createBadge("Internship"),
//     ],
//     location: "Mae Sot, Thailand",
//     startDate: "January 15, 2025",
//     duration: "3 months",
//     schedule: "Mon, Wed, Fri: 2:00 PM - 4:00 PM",
//     availableDays: [false, true, false, true, false, true, false],
//     description:
//       "This comprehensive Thai language course is designed for beginners and intermediate learners living in Mae Sot.",
//     outcomes: [
//       "Develop conversational Thai skills for daily interactions",
//       "Learn to read and write basic Thai script",
//     ],
//     scheduleDetails:
//       "Classes run three days per week (Monday, Wednesday, and Friday) from 2:00 PM to 4:00 PM.",
//     selectionCriteria: [
//       "Open to all residents of Mae Sot area aged 15 and above",
//       "No prior Thai language knowledge required for beginners class",
//     ],
//     faq: [
//       {
//         question: "Do I need to bring any materials to class?",
//         answer: "All essential learning materials will be provided.",
//       },
//     ],
//     organizationInfo: {
//       name: "Youth Learning Center",
//       description:
//         "The Youth Learning Center is a community-based educational institution in Mae Sot.",
//       phone: "+66 55 123 4567",
//       email: "info@youthlearningcenter.org",
//       address: "123 Main Road, Mae Sot, Tak Province 63110, Thailand",
//       facebookPage: "https://facebook.com/youthlearningcenter",
//       mapLocation: {
//         lat: 16.7167,
//         lng: 98.5714,
//       },
//     },
//   },

//   {
//     id: "3",
//     images: [
//       "/images/courses/C5.jpg",
//       "/images/courses/C3.jpg",
//       "/images/courses/C4.jpg",
//     ],
//     title: "English Language Course",
//     subtitle: "Youth Learning Center",
//     badges: [
//       createBadge("Language"),
//       createBadge("In-Person"),
//       createBadge("Technology"),
//     ],
//     location: "Mae Sot, Thailand",
//     startDate: "January 15, 2025",
//     duration: "3 months",
//     schedule: "Mon, Wed, Fri: 2:00 PM - 4:00 PM",
//     availableDays: [false, true, false, true, false, true, false],
//     description:
//       "This comprehensive Thai language course is designed for beginners and intermediate learners living in Mae Sot.",
//     outcomes: [
//       "Develop conversational Thai skills for daily interactions",
//       "Learn to read and write basic Thai script",
//     ],
//     scheduleDetails:
//       "Classes run three days per week (Monday, Wednesday, and Friday) from 2:00 PM to 4:00 PM.",
//     selectionCriteria: [
//       "Open to all residents of Mae Sot area aged 15 and above",
//       "No prior Thai language knowledge required for beginners class",
//     ],
//     faq: [
//       {
//         question: "Do I need to bring any materials to class?",
//         answer: "All essential learning materials will be provided.",
//       },
//     ],
//     organizationInfo: {
//       name: "Youth Learning Center",
//       description:
//         "The Youth Learning Center is a community-based educational institution in Mae Sot.",
//       phone: "+66 55 123 4567",
//       email: "info@youthlearningcenter.org",
//       address: "123 Main Road, Mae Sot, Tak Province 63110, Thailand",
//       facebookPage: "https://facebook.com/youthlearningcenter",
//       mapLocation: {
//         lat: 16.7167,
//         lng: 98.5714,
//       },
//     },
//   },

//   {
//     id: "4",
//     images: [
//       "/images/courses/C3.jpg",
//       "/images/courses/C6.jpg",
//       "/images/courses/C4.jpg",
//     ],
//     title: "Spain Language Course",
//     subtitle: "Youth Learning Center",
//     badges: [
//       createBadge("Language"),
//       createBadge("In-Person"),
//       createBadge("Free"),
//     ],
//     location: "Mae Sot, Thailand",
//     startDate: "January 15, 2025",
//     duration: "3 months",
//     schedule: "Mon, Wed, Fri: 2:00 PM - 4:00 PM",
//     availableDays: [false, true, false, true, false, true, false],
//     description:
//       "This comprehensive Thai language course is designed for beginners and intermediate learners living in Mae Sot.",
//     outcomes: [
//       "Develop conversational Thai skills for daily interactions",
//       "Learn to read and write basic Thai script",
//     ],
//     scheduleDetails:
//       "Classes run three days per week (Monday, Wednesday, and Friday) from 2:00 PM to 4:00 PM.",
//     selectionCriteria: [
//       "Open to all residents of Mae Sot area aged 15 and above",
//       "No prior Thai language knowledge required for beginners class",
//     ],
//     faq: [
//       {
//         question: "Do I need to bring any materials to class?",
//         answer: "All essential learning materials will be provided.",
//       },
//     ],
//     organizationInfo: {
//       name: "Youth Learning Center",
//       description:
//         "The Youth Learning Center is a community-based educational institution in Mae Sot.",
//       phone: "+66 55 123 4567",
//       email: "info@youthlearningcenter.org",
//       address: "123 Main Road, Mae Sot, Tak Province 63110, Thailand",
//       facebookPage: "https://facebook.com/youthlearningcenter",
//       mapLocation: {
//         lat: 16.7167,
//         lng: 98.5714,
//       },
//     },
//   },

//   // Add your other courses here
// ];
