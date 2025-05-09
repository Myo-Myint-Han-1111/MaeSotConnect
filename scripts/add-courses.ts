import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function addCourses() {
  try {
    console.log("Starting to add courses...");

    // First, clear existing data
    await prisma.fAQ.deleteMany();
    await prisma.badge.deleteMany();
    await prisma.image.deleteMany();
    await prisma.course.deleteMany();
    await prisma.organization.deleteMany();

    console.log("Cleared existing data");

    // Course 1: Thai Language Course
    const course1 = await prisma.course.create({
      data: {
        id: "course1",
        title: "Thai Language Course",
        subtitle: "Beginner Level for Foreigners",
        location: "Mae Sot Community Center",
        startDate: "June 15, 2025",
        duration: "3 months",
        schedule: "Mon, Wed, Fri: 10:00 AM - 12:00 PM",
        fee: "3,500 THB",
        availableDays: [false, true, false, true, false, true, false],
        description:
          "A comprehensive Thai language course designed for beginners. Learn to read, write and speak Thai with confidence.",
        outcomes: [
          "Read and write basic Thai script",
          "Hold everyday conversations in Thai",
          "Understand common Thai phrases and expressions",
          "Navigate Thai culture and customs appropriately",
        ],
        scheduleDetails:
          "Classes meet three days per week on Monday, Wednesday, and Friday from 10:00 AM to 12:00 PM. Additional practice sessions available on Saturdays.",
        selectionCriteria: [
          "No prior Thai language knowledge required",
          "Must be at least 18 years old",
          "Commitment to attend at least 80% of classes",
        ],

        // Create related records
        images: {
          create: [
            { url: "/images/courses/C1.jpg" },
            { url: "/images/courses/C2.jpg" },
            { url: "/images/courses/C3.jpg" },
          ],
        },
        badges: {
          create: [
            { text: "Language", color: "#fff", backgroundColor: "#6e8efb" },
            { text: "In-Person", color: "#fff", backgroundColor: "#28a745" },
            { text: "Beginner", color: "#000", backgroundColor: "#ffc107" },
          ],
        },
        faq: {
          create: [
            {
              question: "Do I need to bring any materials to class?",
              answer:
                "All essential learning materials will be provided, but please bring a notebook and pen for taking notes.",
            },
            {
              question: "Is there a final exam?",
              answer:
                "Yes, there will be a final assessment to evaluate your progress, but it's designed to be encouraging rather than stressful.",
            },
          ],
        },
        organizationInfo: {
          create: {
            name: "Mae Sot Community Education Center",
            description:
              "Providing accessible education opportunities for the diverse community of Mae Sot since 2010.",
            phone: "+66 55 123 4567",
            email: "info@maesoteducation.org",
            address: "123 Main Road, Mae Sot, Tak Province 63110, Thailand",
            facebookPage: "https://facebook.com/maesoteducation",
            latitude: 16.7167,
            longitude: 98.5714,
          },
        },
      },
    });

    console.log("Added Course 1:", course1.title);

    // Course 2: Computer Skills Workshop
    const course2 = await prisma.course.create({
      data: {
        id: "course2",
        title: "Computer Skills Workshop",
        subtitle: "Essential Digital Literacy",
        location: "Mae Sot Tech Hub",
        startDate: "July 1, 2025",
        duration: "6 weeks",
        schedule: "Tue, Thu: 2:00 PM - 5:00 PM",
        fee: "2,000 THB",
        availableDays: [false, false, true, false, true, false, false],
        description:
          "Learn essential computer skills including Microsoft Office, email communication, and internet research.",
        outcomes: [
          "Proficiency in Word, Excel, and PowerPoint",
          "Email management and digital communication",
          "Internet research and online safety",
          "Basic troubleshooting skills",
        ],
        scheduleDetails:
          "Two sessions per week, each lasting 3 hours with a short break in the middle. Extra lab time available on weekends.",
        selectionCriteria: [
          "Basic computer familiarity preferred but not required",
          "Open to participants aged 16 and above",
          "Must attend orientation session before classes begin",
        ],

        images: {
          create: [
            { url: "/images/courses/C4.jpg" },
            { url: "/images/courses/C5.jpg" },
            { url: "/images/courses/C6.jpg" },
          ],
        },
        badges: {
          create: [
            { text: "Technology", color: "#fff", backgroundColor: "#007bff" },
            { text: "In-Person", color: "#fff", backgroundColor: "#28a745" },
          ],
        },
        faq: {
          create: [
            {
              question: "Do I need to bring my own laptop?",
              answer:
                "No, computers will be provided in our lab, but you're welcome to bring your own device if you prefer.",
            },
            {
              question: "Will I receive a certificate?",
              answer:
                "Yes, upon successful completion of the course, you'll receive a certificate of completion.",
            },
          ],
        },
      },
    });

    console.log("Added Course 2:", course2.title);

    // Course 3: Sewing and Textile Design
    const course3 = await prisma.course.create({
      data: {
        id: "course3",
        title: "Sewing and Textile Design",
        subtitle: "Practical Skills for Employment",
        location: "Mae Sot Vocational Center",
        startDate: "June 10, 2025",
        duration: "4 months",
        schedule: "Mon, Wed, Fri: 1:00 PM - 4:00 PM",
        fee: "Free",
        availableDays: [false, true, false, true, false, true, false],
        description:
          "Learn practical sewing and textile design skills with a focus on employment opportunities in local garment industries.",
        outcomes: [
          "Master basic to intermediate sewing techniques",
          "Operate standard sewing machines efficiently",
          "Design and create basic garments",
          "Understand quality control standards in garment production",
        ],
        scheduleDetails:
          "Three-hour sessions, three days per week. Program includes visits to local factories and workshops.",
        selectionCriteria: [
          "Priority given to residents seeking employment opportunities",
          "No previous experience required",
          "Must commit to full program duration",
          "Ages 18-45 preferred",
        ],

        images: {
          create: [
            { url: "/images/courses/C2.jpg" },
            { url: "/images/courses/C3.jpg" },
            { url: "/images/courses/C1.jpg" },
          ],
        },
        badges: {
          create: [
            { text: "Vocational", color: "#fff", backgroundColor: "#6610f2" },
            { text: "Free", color: "#fff", backgroundColor: "#dc3545" },
          ],
        },
        faq: {
          create: [
            {
              question: "Is there an age limit for the program?",
              answer:
                "While we prioritize participants between 18-45 years old, we welcome applicants of all ages with a genuine interest in the field.",
            },
            {
              question: "Are materials provided?",
              answer:
                "Yes, all sewing materials, fabrics, and equipment are provided at no cost to participants.",
            },
          ],
        },
        organizationInfo: {
          create: {
            name: "Mae Sot Vocational Training Center",
            description:
              "Empowering the community through practical skills training and employment preparation.",
            phone: "+66 55 987 6543",
            email: "contact@maesotvocational.org",
            address:
              "456 Industrial Road, Mae Sot, Tak Province 63110, Thailand",
            facebookPage: "https://facebook.com/maesotvocational",
            latitude: 16.7215,
            longitude: 98.5698,
          },
        },
      },
    });

    console.log("Added Course 3:", course3.title);

    // Course 4: English Conversation Club
    const course4 = await prisma.course.create({
      data: {
        id: "course4",
        title: "English Conversation Club",
        subtitle: "Improve Your Speaking Skills",
        location: "International Learning Hub",
        startDate: "Ongoing - Join Anytime",
        duration: "Ongoing",
        schedule: "Sat: 10:00 AM - 12:00 PM",
        fee: "Free",
        availableDays: [false, false, false, false, false, false, true],
        description:
          "A weekly conversation club for practicing English speaking skills in a supportive, relaxed environment.",
        outcomes: [
          "Increased confidence in speaking English",
          "Expanded vocabulary for everyday situations",
          "Improved pronunciation and fluency",
          "Make connections with other English learners and native speakers",
        ],
        scheduleDetails:
          "Meet every Saturday morning. Drop-in format - no need to attend every session. Different conversation themes each week.",
        selectionCriteria: [
          "Basic English understanding required",
          "Open to all ages and backgrounds",
          "No registration needed - just show up!",
        ],

        images: {
          create: [
            { url: "/images/courses/C6.jpg" },
            { url: "/images/courses/C4.jpg" },
            { url: "/images/courses/C5.jpg" },
          ],
        },
        badges: {
          create: [
            { text: "Language", color: "#fff", backgroundColor: "#6e8efb" },
            { text: "Free", color: "#fff", backgroundColor: "#dc3545" },
          ],
        },
        faq: {
          create: [
            {
              question: "What if I miss a week?",
              answer:
                "No problem! The conversation club is designed to accommodate drop-in participation. Each session stands alone.",
            },
            {
              question: "What level of English is required?",
              answer:
                "You should be able to introduce yourself and understand basic instructions in English. All levels above complete beginner are welcome.",
            },
          ],
        },
      },
    });

    // Course 5: Sustainable Agriculture Workshop
    const course5 = await prisma.course.create({
      data: {
        id: "course5",
        title: "Sustainable Agriculture Workshop",
        subtitle: "Learn Organic Farming Techniques",
        location: "Mae Sot Community Garden",
        startDate: "July 5, 2025",
        duration: "2 months",
        schedule: "Sat, Sun: 8:00 AM - 11:00 AM",
        fee: "1,500 THB",
        availableDays: [false, false, false, false, false, true, true],
        description:
          "Learn sustainable and organic farming techniques suitable for small-scale production in the Mae Sot region.",
        outcomes: [
          "Understand principles of organic farming",
          "Set up a small home garden",
          "Practice natural pest management techniques",
          "Learn about local seasonal crops and market opportunities",
        ],
        scheduleDetails:
          "Weekend morning sessions with hands-on field activities. Includes one field trip to a local organic farm.",
        selectionCriteria: [
          "No prior experience needed",
          "Must be able to participate in physical activities",
          "Ages 16 and above welcome",
        ],
        images: {
          create: [
            { url: "/images/courses/C3.jpg" },
            { url: "/images/courses/C1.jpg" },
            { url: "/images/courses/C5.jpg" },
          ],
        },
        badges: {
          create: [
            { text: "Vocational", color: "#fff", backgroundColor: "#6610f2" },
            { text: "In-Person", color: "#fff", backgroundColor: "#28a745" },
          ],
        },
        faq: {
          create: [
            {
              question: "Do I need to bring my own tools?",
              answer:
                "Basic gardening tools will be provided, but you may bring your own gloves if preferred.",
            },
            {
              question: "Will I be able to take home what I grow?",
              answer:
                "Yes! Participants will harvest and share the produce grown during the course.",
            },
          ],
        },
        organizationInfo: {
          create: {
            name: "Mae Sot Agricultural Collective",
            description:
              "Promoting sustainable farming practices and food security in the border region.",
            phone: "+66 55 234 5678",
            email: "grow@maesotfarm.org",
            address: "78 Rural Road, Mae Sot, Tak Province 63110, Thailand",
            facebookPage: "https://facebook.com/maesotfarm",
            latitude: 16.7132,
            longitude: 98.569,
          },
        },
      },
    });

    // Course 6: Basic Healthcare Training
    const course6 = await prisma.course.create({
      data: {
        id: "course6",
        title: "Basic Healthcare Training",
        subtitle: "First Aid and Community Health",
        location: "Mae Sot Health Center",
        startDate: "August 1, 2025",
        duration: "6 weeks",
        schedule: "Tue, Thu: 5:30 PM - 7:30 PM",
        fee: "1,200 THB",
        availableDays: [false, false, true, false, true, false, false],
        description:
          "Essential healthcare skills for community health volunteers and anyone interested in basic medical knowledge.",
        outcomes: [
          "Perform basic first aid procedures",
          "Recognize common health emergencies",
          "Understand preventive healthcare practices",
          "Support community health initiatives",
        ],
        scheduleDetails:
          "Evening classes twice a week with practical demonstrations and role-playing scenarios.",
        selectionCriteria: [
          "No medical background required",
          "Must be at least 18 years old",
          "Commitment to community service preferred",
        ],
        images: {
          create: [
            { url: "/images/courses/C6.jpg" },
            { url: "/images/courses/C2.jpg" },
            { url: "/images/courses/C4.jpg" },
          ],
        },
        badges: {
          create: [
            { text: "Vocational", color: "#fff", backgroundColor: "#6610f2" },
            { text: "In-Person", color: "#fff", backgroundColor: "#28a745" },
          ],
        },
        faq: {
          create: [
            {
              question: "Will I receive a certificate?",
              answer:
                "Yes, a recognized basic first aid certificate will be provided upon completion.",
            },
            {
              question: "Do I need to bring anything to class?",
              answer:
                "Just a notebook and pen. All training materials will be provided.",
            },
          ],
        },
      },
    });

    // Course 7: Youth Leadership Program
    const course7 = await prisma.course.create({
      data: {
        id: "course7",
        title: "Youth Leadership Program",
        subtitle: "Developing Tomorrow's Leaders",
        location: "Mae Sot Youth Center",
        startDate: "September 5, 2025",
        duration: "3 months",
        schedule: "Wed, Sat: 3:00 PM - 5:00 PM",
        fee: "Free",
        availableDays: [false, false, false, true, false, true, false],
        description:
          "A comprehensive program to develop leadership skills, civic engagement, and community project management for young people.",
        outcomes: [
          "Develop effective communication and public speaking skills",
          "Learn project planning and team management",
          "Build confidence in leadership roles",
          "Create and implement a community service project",
        ],
        scheduleDetails:
          "Two sessions per week plus a weekend leadership retreat midway through the program.",
        selectionCriteria: [
          "Ages 15-24",
          "Demonstrated interest in community service",
          "Application and brief interview required",
          "Limited to 20 participants",
        ],
        images: {
          create: [
            { url: "/images/courses/C5.jpg" },
            { url: "/images/courses/C2.jpg" },
            { url: "/images/courses/C6.jpg" },
          ],
        },
        badges: {
          create: [
            { text: "Free", color: "#fff", backgroundColor: "#dc3545" },
            { text: "In-Person", color: "#fff", backgroundColor: "#28a745" },
          ],
        },
        faq: {
          create: [
            {
              question: "How competitive is the application process?",
              answer:
                "We aim to create a diverse group of participants. While not everyone may be selected, we encourage all interested youth to apply.",
            },
            {
              question: "What kind of community projects will we work on?",
              answer:
                "Participants will identify community needs and develop their own project proposals. Past projects have included environmental initiatives, educational workshops, and cultural events.",
            },
          ],
        },
        organizationInfo: {
          create: {
            name: "Mae Sot Youth Empowerment Network",
            description:
              "Dedicated to developing leadership skills and civic engagement among young people in the border region.",
            phone: "+66 55 321 7654",
            email: "youth@maesotempowerment.org",
            address:
              "42 Community Street, Mae Sot, Tak Province 63110, Thailand",
            facebookPage: "https://facebook.com/maesotyouth",
            latitude: 16.719,
            longitude: 98.575,
          },
        },
      },
    });

    // Course 8: Burmese Language for Beginners
    const course8 = await prisma.course.create({
      data: {
        id: "course8",
        title: "Burmese Language for Beginners",
        subtitle: "Essential Communication Skills",
        location: "Border Languages Institute",
        startDate: "June 20, 2025",
        duration: "10 weeks",
        schedule: "Mon, Fri: 9:00 AM - 11:00 AM",
        fee: "3,000 THB",
        availableDays: [false, true, false, false, false, true, false],
        description:
          "Learn basic Burmese language skills to communicate effectively in this culturally diverse border region.",
        outcomes: [
          "Master Burmese alphabet and basic reading",
          "Hold simple conversations in everyday situations",
          "Understand common phrases and greetings",
          "Develop cultural awareness and appropriate customs",
        ],
        scheduleDetails:
          "Two sessions per week with conversational practice and cultural activities.",
        selectionCriteria: [
          "No prior Burmese language knowledge required",
          "Open to all adults",
          "Commitment to regular attendance and practice",
        ],
        images: {
          create: [
            { url: "/images/courses/C1.jpg" },
            { url: "/images/courses/C3.jpg" },
            { url: "/images/courses/C4.jpg" },
          ],
        },
        badges: {
          create: [
            { text: "Language", color: "#fff", backgroundColor: "#6e8efb" },
            { text: "Beginner", color: "#000", backgroundColor: "#ffc107" },
          ],
        },
        faq: {
          create: [
            {
              question: "How difficult is Burmese for Thai speakers?",
              answer:
                "While Burmese uses a different script, many Thai speakers find certain sounds familiar. Our course is specially designed for the local context.",
            },
            {
              question: "Will I learn to write in Burmese script?",
              answer:
                "Yes, the course includes basic writing practice, though the primary focus is on speaking and listening skills.",
            },
          ],
        },
      },
    });

    // Course 9: Small Business Entrepreneurship
    const course9 = await prisma.course.create({
      data: {
        id: "course9",
        title: "Small Business Entrepreneurship",
        subtitle: "From Idea to Launch",
        location: "Mae Sot Business Development Center",
        startDate: "July 15, 2025",
        duration: "8 weeks",
        schedule: "Tue, Thu: 6:00 PM - 8:00 PM",
        fee: "2,500 THB",
        availableDays: [false, false, true, false, true, false, false],
        description:
          "Learn how to start and run a small business in the local market, from initial idea to successful launch.",
        outcomes: [
          "Develop a viable business plan",
          "Understand basic accounting and financial management",
          "Learn marketing strategies for the local market",
          "Navigate licensing and regulatory requirements",
        ],
        scheduleDetails:
          "Evening classes twice a week with guest entrepreneurs and mentorship opportunities.",
        selectionCriteria: [
          "Must have a basic business idea or concept",
          "Basic literacy and numeracy skills required",
          "Ages 20 and above preferred",
        ],
        images: {
          create: [
            { url: "/images/courses/C4.jpg" },
            { url: "/images/courses/C6.jpg" },
            { url: "/images/courses/C2.jpg" },
          ],
        },
        badges: {
          create: [
            { text: "Vocational", color: "#fff", backgroundColor: "#6610f2" },
            { text: "In-Person", color: "#fff", backgroundColor: "#28a745" },
          ],
        },
        faq: {
          create: [
            {
              question: "Do I need to have money to start my business already?",
              answer:
                "No, the course will cover options for startup funding, including microloans and community resources.",
            },
            {
              question: "Will I have a complete business plan by the end?",
              answer:
                "Yes, creating your own business plan is a core outcome of the course, with individual feedback from experienced entrepreneurs.",
            },
          ],
        },
        organizationInfo: {
          create: {
            name: "Mae Sot Economic Development Foundation",
            description:
              "Supporting local entrepreneurship and sustainable economic growth in the border region.",
            phone: "+66 55 765 4321",
            email: "info@maesotbusiness.org",
            address: "88 Market Road, Mae Sot, Tak Province 63110, Thailand",
            facebookPage: "https://facebook.com/maesotbusiness",
            latitude: 16.7175,
            longitude: 98.568,
          },
        },
      },
    });

    // Course 10: Digital Marketing Basics
    const course10 = await prisma.course.create({
      data: {
        id: "course10",
        title: "Digital Marketing Basics",
        subtitle: "Promote Your Business Online",
        location: "Mae Sot Digital Hub",
        startDate: "August 10, 2025",
        duration: "4 weeks",
        schedule: "Mon, Wed: 6:30 PM - 8:30 PM",
        fee: "1,800 THB",
        availableDays: [false, true, false, true, false, false, false],
        description:
          "Learn how to effectively market your business or organization online using social media, websites, and digital advertising.",
        outcomes: [
          "Create and manage social media business accounts",
          "Develop effective content for online platforms",
          "Understand digital advertising basics",
          "Measure and analyze online marketing performance",
        ],
        scheduleDetails:
          "Evening classes twice a week with practical exercises and live demonstrations.",
        selectionCriteria: [
          "Basic computer skills required",
          "Suitable for business owners, staff, and marketing enthusiasts",
          "Participants should have access to a smartphone",
        ],
        images: {
          create: [
            { url: "/images/courses/C5.jpg" },
            { url: "/images/courses/C1.jpg" },
            { url: "/images/courses/C3.jpg" },
          ],
        },
        badges: {
          create: [
            { text: "Technology", color: "#fff", backgroundColor: "#007bff" },
            { text: "In-Person", color: "#fff", backgroundColor: "#28a745" },
          ],
        },
        faq: {
          create: [
            {
              question: "Do I need to have a business already?",
              answer:
                "No, the skills are applicable to promoting businesses, organizations, events, or personal brands.",
            },
            {
              question: "Will we use Facebook only or other platforms too?",
              answer:
                "We cover multiple platforms including Facebook, Instagram, LINE, and basic website development with WordPress.",
            },
          ],
        },
      },
    });

    // Course 11: Traditional Thai Cooking
    const course11 = await prisma.course.create({
      data: {
        id: "course11",
        title: "Traditional Thai Cooking",
        subtitle: "Master the Art of Thai Cuisine",
        location: "Mae Sot Culinary Center",
        startDate: "September 1, 2025",
        duration: "6 weeks",
        schedule: "Sat: 1:00 PM - 4:00 PM",
        fee: "4,500 THB (includes ingredients)",
        availableDays: [false, false, false, false, false, false, true],
        description:
          "Learn authentic Thai cooking techniques, ingredients, and recipes in this hands-on culinary course.",
        outcomes: [
          "Master essential Thai cooking techniques",
          "Understand key ingredients and flavor principles",
          "Prepare classic Thai dishes independently",
          "Adapt recipes for different dietary needs",
        ],
        scheduleDetails:
          "Weekly 3-hour hands-on cooking sessions. All ingredients and equipment provided.",
        selectionCriteria: [
          "No cooking experience required",
          "Ages 16 and above",
          "Limited to 12 participants per class",
        ],
        images: {
          create: [
            { url: "/images/courses/C2.jpg" },
            { url: "/images/courses/C6.jpg" },
            { url: "/images/courses/C4.jpg" },
          ],
        },
        badges: {
          create: [
            { text: "Vocational", color: "#fff", backgroundColor: "#6610f2" },
            { text: "In-Person", color: "#fff", backgroundColor: "#28a745" },
          ],
        },
        faq: {
          create: [
            {
              question: "Can I accommodate dietary restrictions?",
              answer:
                "Yes, vegetarian and some allergy-friendly options will be available. Please notify us in advance.",
            },
            {
              question: "Do I get to eat what I cook?",
              answer:
                "Absolutely! Each session includes time to enjoy your creations, and you'll be able to take leftovers home.",
            },
          ],
        },
        organizationInfo: {
          create: {
            name: "Mae Sot Culinary Arts Association",
            description:
              "Preserving and sharing traditional Thai cooking techniques while creating vocational opportunities.",
            phone: "+66 55 444 3333",
            email: "cook@maesotculinary.org",
            address: "55 Market Street, Mae Sot, Tak Province 63110, Thailand",
            facebookPage: "https://facebook.com/maesotculinary",
            latitude: 16.7158,
            longitude: 98.5733,
          },
        },
      },
    });

    // Course 12: Environmental Conservation Workshop
    const course12 = await prisma.course.create({
      data: {
        id: "course12",
        title: "Environmental Conservation Workshop",
        subtitle: "Protecting Our Local Ecosystem",
        location: "Mae Sot Environmental Center",
        startDate: "July 8, 2025",
        duration: "5 weeks",
        schedule: "Sun: 9:00 AM - 12:00 PM",
        fee: "Free",
        availableDays: [false, false, false, false, false, false, true],
        description:
          "Learn about local environmental challenges and conservation techniques to protect the natural resources of the Mae Sot region.",
        outcomes: [
          "Understand local environmental challenges",
          "Learn sustainable waste management practices",
          "Participate in conservation activities",
          "Develop community-based environmental initiatives",
        ],
        scheduleDetails:
          "Weekly sessions with classroom learning and field activities. Includes two environmental cleanup events.",
        selectionCriteria: [
          "Open to all ages (children under 12 must be accompanied by an adult)",
          "No prior knowledge required",
          "Commitment to community environmental action",
        ],
        images: {
          create: [
            { url: "/images/courses/C3.jpg" },
            { url: "/images/courses/C5.jpg" },
            { url: "/images/courses/C1.jpg" },
          ],
        },
        badges: {
          create: [
            { text: "Free", color: "#fff", backgroundColor: "#dc3545" },
            { text: "In-Person", color: "#fff", backgroundColor: "#28a745" },
          ],
        },
        faq: {
          create: [
            {
              question: "Is this course suitable for children?",
              answer:
                "Yes, we welcome families! Activities are designed to be engaging for all ages, though children under 12 need adult supervision.",
            },
            {
              question: "What should I wear to the field activities?",
              answer:
                "Comfortable clothing, closed-toe shoes, a hat, and sun protection are recommended for outdoor activities.",
            },
          ],
        },
        organizationInfo: {
          create: {
            name: "Mae Sot Environmental Protection Network",
            description:
              "A community organization dedicated to preserving the natural beauty and resources of the Mae Sot region.",
            phone: "+66 55 888 7777",
            email: "green@maesotenvironment.org",
            address: "22 River Road, Mae Sot, Tak Province 63110, Thailand",
            facebookPage: "https://facebook.com/maesotenvironment",
            latitude: 16.722,
            longitude: 98.5745,
          },
        },
      },
    });

    // Course 13: Advanced English for Professionals
    const course13 = await prisma.course.create({
      data: {
        id: "course13",
        title: "Advanced English for Professionals",
        subtitle: "Business Communication Skills",
        location: "International Business Center",
        startDate: "August 15, 2025",
        duration: "8 weeks",
        schedule: "Tue, Thu: 5:30 PM - 7:00 PM",
        fee: "5,000 THB",
        availableDays: [false, false, true, false, true, false, false],
        description:
          "Enhance your professional English communication skills for business contexts, including presentations, emails, and negotiations.",
        outcomes: [
          "Deliver effective business presentations",
          "Write clear and professional emails",
          "Participate confidently in meetings and negotiations",
          "Expand business-specific vocabulary",
        ],
        scheduleDetails:
          "Evening classes twice a week with role-playing, simulations, and individual coaching.",
        selectionCriteria: [
          "Intermediate to advanced English proficiency required",
          "Working professionals preferred",
          "Brief assessment test before enrollment",
        ],
        images: {
          create: [
            { url: "/images/courses/C6.jpg" },
            { url: "/images/courses/C4.jpg" },
            { url: "/images/courses/C2.jpg" },
          ],
        },
        badges: {
          create: [
            { text: "Language", color: "#fff", backgroundColor: "#6e8efb" },
            { text: "In-Person", color: "#fff", backgroundColor: "#28a745" },
          ],
        },
        faq: {
          create: [
            {
              question: "How do I know if my English level is sufficient?",
              answer:
                "We offer a free pre-enrollment assessment. As a guideline, you should be able to hold conversations in English with minimal difficulty.",
            },
            {
              question:
                "Will this help with job applications to international companies?",
              answer:
                "Yes, the course includes modules on CV writing, job interviews, and professional networking in English.",
            },
          ],
        },
      },
    });

    // Course 14: Childcare Certification
    const course14 = await prisma.course.create({
      data: {
        id: "course14",
        title: "Childcare Certification",
        subtitle: "Professional Childcare Training",
        location: "Mae Sot Family Center",
        startDate: "September 10, 2025",
        duration: "12 weeks",
        schedule: "Mon, Wed, Fri: 9:00 AM - 11:30 AM",
        fee: "3,500 THB",
        availableDays: [false, true, false, true, false, true, false],
        description:
          "Comprehensive training for those seeking careers in childcare, early childhood education, or improving their family caregiving skills.",
        outcomes: [
          "Understand child development stages",
          "Learn age-appropriate activities and education",
          "Master safety and first aid for children",
          "Develop positive guidance and discipline techniques",
        ],
        scheduleDetails:
          "Three morning sessions per week with classroom learning and supervised practicum at a local childcare center.",
        selectionCriteria: [
          "Must be at least 18 years old",
          "Clean background check required",
          "Genuine interest in working with children",
          "Basic literacy and communication skills",
        ],
        images: {
          create: [
            { url: "/images/courses/C1.jpg" },
            { url: "/images/courses/C5.jpg" },
            { url: "/images/courses/C3.jpg" },
          ],
        },
        badges: {
          create: [
            { text: "Vocational", color: "#fff", backgroundColor: "#6610f2" },
            { text: "In-Person", color: "#fff", backgroundColor: "#28a745" },
            {
              text: "Certification",
              color: "#fff",
              backgroundColor: "#17a2b8",
            },
          ],
        },
        faq: {
          create: [
            {
              question: "Is this certification recognized by employers?",
              answer:
                "Yes, our certification is recognized by local childcare facilities and meets basic requirements for childcare positions.",
            },
            {
              question: "Do I need experience with children to enroll?",
              answer:
                "No prior professional experience is required, though some familiarity with children is helpful.",
            },
          ],
        },
        organizationInfo: {
          create: {
            name: "Mae Sot Child Development Institute",
            description:
              "Promoting quality childcare and early education through professional training and family support.",
            phone: "+66 55 222 1111",
            email: "info@maesotchildcare.org",
            address:
              "33 Community Avenue, Mae Sot, Tak Province 63110, Thailand",
            facebookPage: "https://facebook.com/maesotchildcare",
            latitude: 16.7145,
            longitude: 98.5722,
          },
        },
      },
    });

    console.log("Added Course 4:", course4.title);

    console.log("Added Course 5:", course5.title);

    console.log("Added Course 6:", course6.title);

    console.log("Added Course 7:", course7.title);

    console.log("Added Course 8:", course8.title);

    console.log("Added Course 9:", course9.title);

    console.log("Added Course 10:", course10.title);

    console.log("Added Course 11:", course11.title);

    console.log("Added Course 12:", course12.title);

    console.log("Added Course 13:", course13.title);

    console.log("Added Course 14:", course14.title);

    // Course 15: Mobile Phone Repair Workshop
    const course15 = await prisma.course.create({
      data: {
        id: "course15",
        title: "Mobile Phone Repair Workshop",
        subtitle: "Practical Tech Skills for Employment",
        location: "Mae Sot Tech Center",
        startDate: "August 5, 2025",
        duration: "6 weeks",
        schedule: "Mon, Wed: 5:00 PM - 8:00 PM",
        fee: "2,800 THB (includes toolkit)",
        availableDays: [false, true, false, true, false, false, false],
        description:
          "Learn practical mobile phone repair skills for employment opportunities in the growing tech repair industry.",
        outcomes: [
          "Diagnose common mobile phone issues",
          "Replace screens, batteries, and other components",
          "Use specialized repair tools effectively",
          "Understand basic electronics troubleshooting",
        ],
        scheduleDetails:
          "Two 3-hour sessions per week, combining theory and hands-on practice. Each student will receive a basic repair toolkit.",
        selectionCriteria: [
          "Basic technical aptitude recommended",
          "Good hand-eye coordination and fine motor skills",
          "Must be at least 16 years old",
        ],
        images: {
          create: [
            { url: "/images/courses/C4.jpg" },
            { url: "/images/courses/C2.jpg" },
            { url: "/images/courses/C6.jpg" },
          ],
        },
        badges: {
          create: [
            { text: "Technology", color: "#fff", backgroundColor: "#007bff" },
            { text: "Vocational", color: "#fff", backgroundColor: "#6610f2" },
          ],
        },
        faq: {
          create: [
            {
              question: "Do I need to bring my own broken phones?",
              answer:
                "No, we provide practice devices. However, you're welcome to bring your own phones for specific repair questions during the final week.",
            },
            {
              question: "Is this course suitable for complete beginners?",
              answer:
                "Yes, we start with the basics. While some technical aptitude is helpful, no prior repair experience is required.",
            },
          ],
        },
      },
    });
    console.log("Added Course 15:", course15.title);

    // Course 16: Women's Empowerment Workshop
    const course16 = await prisma.course.create({
      data: {
        id: "course16",
        title: "Women's Empowerment Workshop",
        subtitle: "Building Confidence and Skills",
        location: "Mae Sot Women's Center",
        startDate: "July 20, 2025",
        duration: "8 weeks",
        schedule: "Sat: 10:00 AM - 1:00 PM",
        fee: "Free",
        availableDays: [false, false, false, false, false, false, true],
        description:
          "A supportive workshop series designed to empower women through skills development, confidence building, and community connection.",
        outcomes: [
          "Develop personal confidence and self-advocacy skills",
          "Create a personal or professional development plan",
          "Build a supportive community network",
          "Learn about women's rights and resources",
        ],
        scheduleDetails:
          "Weekly Saturday sessions with group discussions, activities, and guest speakers. Optional mentorship pairing available.",
        selectionCriteria: [
          "Open to women of all ages and backgrounds",
          "Limited to 20 participants per cohort",
          "Registration required",
        ],
        images: {
          create: [
            { url: "/images/courses/C5.jpg" },
            { url: "/images/courses/C1.jpg" },
            { url: "/images/courses/C3.jpg" },
          ],
        },
        badges: {
          create: [
            { text: "Free", color: "#fff", backgroundColor: "#dc3545" },
            { text: "In-Person", color: "#fff", backgroundColor: "#28a745" },
          ],
        },
        faq: {
          create: [
            {
              question: "Is childcare available during the workshops?",
              answer:
                "Yes, free childcare services are available on-site. Please indicate your needs when registering.",
            },
            {
              question: "Is this only for women who work outside the home?",
              answer:
                "No, this workshop is for all women regardless of employment status, including homemakers, students, and those seeking employment.",
            },
          ],
        },
        organizationInfo: {
          create: {
            name: "Mae Sot Women's Empowerment Coalition",
            description:
              "Supporting women's rights, opportunities, and community leadership in the border region.",
            phone: "+66 55 333 2222",
            email: "info@maesotwomen.org",
            address:
              "44 Community Street, Mae Sot, Tak Province 63110, Thailand",
            facebookPage: "https://facebook.com/maesotwomen",
            latitude: 16.7165,
            longitude: 98.5725,
          },
        },
      },
    });
    console.log("Added Course 16:", course16.title);

    // Course 17: Photography Basics
    const course17 = await prisma.course.create({
      data: {
        id: "course17",
        title: "Photography Basics",
        subtitle: "Capture Beautiful Images",
        location: "Mae Sot Arts Center",
        startDate: "September 7, 2025",
        duration: "5 weeks",
        schedule: "Sun: 2:00 PM - 5:00 PM",
        fee: "2,200 THB",
        availableDays: [false, false, false, false, false, false, true],
        description:
          "Learn the foundations of photography, including composition, lighting, and basic editing to capture beautiful images with any camera.",
        outcomes: [
          "Understand camera settings and functions",
          "Master composition techniques",
          "Work with natural and artificial lighting",
          "Edit photos using free software",
        ],
        scheduleDetails:
          "Weekly Sunday afternoon sessions, including indoor instruction and outdoor practice. Final session includes a group photo expedition.",
        selectionCriteria: [
          "Must have access to any camera (smartphone cameras acceptable)",
          "Open to beginners and intermediate photographers",
          "Ages 14 and above",
        ],
        images: {
          create: [
            { url: "/images/courses/C3.jpg" },
            { url: "/images/courses/C6.jpg" },
            { url: "/images/courses/C1.jpg" },
          ],
        },
        badges: {
          create: [
            { text: "Technology", color: "#fff", backgroundColor: "#007bff" },
            { text: "In-Person", color: "#fff", backgroundColor: "#28a745" },
            { text: "Beginner", color: "#000", backgroundColor: "#ffc107" },
          ],
        },
        faq: {
          create: [
            {
              question: "Can I use just my smartphone?",
              answer:
                "Yes! We teach universal photography principles that apply to any camera. Several sessions will include smartphone-specific techniques.",
            },
            {
              question: "Do I need to purchase editing software?",
              answer:
                "No, we'll focus on free editing tools and apps that work well for beginners.",
            },
          ],
        },
      },
    });
    console.log("Added Course 17:", course17.title);

    // Course 18: First Aid for Parents and Caregivers
    const course18 = await prisma.course.create({
      data: {
        id: "course18",
        title: "First Aid for Parents and Caregivers",
        subtitle: "Child-Specific Emergency Response",
        location: "Mae Sot Family Health Center",
        startDate: "July 12, 2025",
        duration: "3 weeks",
        schedule: "Sat: 9:00 AM - 12:00 PM",
        fee: "1,500 THB",
        availableDays: [false, false, false, false, false, false, true],
        description:
          "Learn specialized first aid techniques for infants and children, providing parents and caregivers with essential skills for handling emergencies.",
        outcomes: [
          "Respond to choking, drowning, and breathing emergencies",
          "Treat wounds, burns, and fractures in children",
          "Recognize signs of serious illness requiring medical attention",
          "Create a safer home environment to prevent accidents",
        ],
        scheduleDetails:
          "Three intensive Saturday morning sessions with hands-on practice using child and infant mannequins.",
        selectionCriteria: [
          "Parents, grandparents, teachers, and childcare providers",
          "No prior medical knowledge required",
          "Limited to 15 participants per class",
        ],
        images: {
          create: [
            { url: "/images/courses/C2.jpg" },
            { url: "/images/courses/C4.jpg" },
            { url: "/images/courses/C5.jpg" },
          ],
        },
        badges: {
          create: [
            {
              text: "Certification",
              color: "#fff",
              backgroundColor: "#17a2b8",
            },
            { text: "In-Person", color: "#fff", backgroundColor: "#28a745" },
          ],
        },
        faq: {
          create: [
            {
              question: "Will I receive a certification?",
              answer:
                "Yes, participants who complete all sessions will receive a certificate valid for 2 years.",
            },
            {
              question: "Should I bring my child to the class?",
              answer:
                "No, we use training mannequins for practice. The class is designed for adult learning without children present.",
            },
          ],
        },
      },
    });
    console.log("Added Course 18:", course18.title);

    // Course 19: Community Radio Production
    const course19 = await prisma.course.create({
      data: {
        id: "course19",
        title: "Community Radio Production",
        subtitle: "Voices of Mae Sot",
        location: "Mae Sot Community Media Center",
        startDate: "August 20, 2025",
        duration: "10 weeks",
        schedule: "Tue, Thu: 4:00 PM - 6:00 PM",
        fee: "1,000 THB",
        availableDays: [false, false, true, false, true, false, false],
        description:
          "Learn to create community radio programs that inform, educate, and entertain. Gain skills in audio production, interviewing, and storytelling.",
        outcomes: [
          "Plan and produce radio segments and full programs",
          "Conduct effective interviews and field recordings",
          "Edit audio using digital tools",
          "Understand community radio ethics and regulations",
        ],
        scheduleDetails:
          "Twice-weekly sessions plus studio time for producing final projects. Includes opportunity to broadcast on local community radio.",
        selectionCriteria: [
          "Interest in community media and storytelling",
          "Basic computer skills helpful but not required",
          "Ages 16 and above",
          "Must participate in final group production",
        ],
        images: {
          create: [
            { url: "/images/courses/C6.jpg" },
            { url: "/images/courses/C1.jpg" },
            { url: "/images/courses/C3.jpg" },
          ],
        },
        badges: {
          create: [
            { text: "Technology", color: "#fff", backgroundColor: "#007bff" },
            { text: "In-Person", color: "#fff", backgroundColor: "#28a745" },
          ],
        },
        faq: {
          create: [
            {
              question: "Do I need to speak Thai fluently?",
              answer:
                "Programs can be produced in multiple languages including Thai, Burmese, Karen, and English. You should be fluent in at least one of these languages.",
            },
            {
              question: "Will my radio program be broadcast?",
              answer:
                "Yes, selected final projects will be broadcast on our partner community radio station, and all projects will be available as podcasts.",
            },
          ],
        },
        organizationInfo: {
          create: {
            name: "Border Voices Media Network",
            description:
              "Empowering community voices through accessible media production and training in the Mae Sot border region.",
            phone: "+66 55 777 8888",
            email: "media@bordervoices.org",
            address: "66 Media Lane, Mae Sot, Tak Province 63110, Thailand",
            facebookPage: "https://facebook.com/bordervoices",
            latitude: 16.718,
            longitude: 98.5735,
          },
        },
      },
    });
    console.log("Added Course 19:", course19.title);

    // Course 20: Mental Health First Aid
    const course20 = await prisma.course.create({
      data: {
        id: "course20",
        title: "Mental Health First Aid",
        subtitle: "Supporting Community Wellbeing",
        location: "Mae Sot Wellness Center",
        startDate: "September 15, 2025",
        duration: "4 weeks",
        schedule: "Wed: 5:30 PM - 8:30 PM",
        fee: "1,200 THB",
        availableDays: [false, false, false, true, false, false, false],
        description:
          "Learn to recognize signs of mental health challenges and provide initial support and guidance toward appropriate professional help.",
        outcomes: [
          "Recognize signs of depression, anxiety, and other common conditions",
          "Approach and support someone in distress",
          "Listen non-judgmentally and offer appropriate reassurance",
          "Connect people to professional resources and support",
        ],
        scheduleDetails:
          "Weekly evening sessions with role-playing exercises and case discussions. Course materials and reference guide included.",
        selectionCriteria: [
          "Open to adults 18 and over",
          "No prior mental health training required",
          "Suitable for community workers, teachers, and concerned citizens",
        ],
        images: {
          create: [
            { url: "/images/courses/C5.jpg" },
            { url: "/images/courses/C3.jpg" },
            { url: "/images/courses/C1.jpg" },
          ],
        },
        badges: {
          create: [
            {
              text: "Certification",
              color: "#fff",
              backgroundColor: "#17a2b8",
            },
            { text: "In-Person", color: "#fff", backgroundColor: "#28a745" },
          ],
        },
        faq: {
          create: [
            {
              question: "Is this the same as becoming a counselor?",
              answer:
                "No, this course teaches first aid principles for mental health—recognizing warning signs and providing initial support until professional help can be obtained.",
            },
            {
              question:
                "Will course materials be available in multiple languages?",
              answer:
                "Yes, materials are available in Thai, Burmese, and English.",
            },
          ],
        },
      },
    });
    console.log("Added Course 20:", course20.title);

    // Course 21: Karen Language and Culture
    const course21 = await prisma.course.create({
      data: {
        id: "course21",
        title: "Karen Language and Culture",
        subtitle: "Connect with Karen Communities",
        location: "Cultural Exchange Center",
        startDate: "August 15, 2025",
        duration: "12 weeks",
        schedule: "Sat: 1:00 PM - 3:30 PM",
        fee: "2,500 THB",
        availableDays: [false, false, false, false, false, false, true],
        description:
          "Learn S'gaw Karen language basics along with cultural traditions, customs, and history to better connect with Karen communities in the region.",
        outcomes: [
          "Master basic Karen greetings and everyday phrases",
          "Understand key cultural practices and traditions",
          "Read and write basic Karen script",
          "Appreciate Karen history and contemporary issues",
        ],
        scheduleDetails:
          "Weekly Saturday afternoon sessions combining language instruction, cultural demonstrations, and guest speakers.",
        selectionCriteria: [
          "Open to anyone interested in Karen language and culture",
          "No prior knowledge required",
          "NGO workers, educators, and healthcare providers encouraged to apply",
        ],
        images: {
          create: [
            { url: "/images/courses/C1.jpg" },
            { url: "/images/courses/C2.jpg" },
            { url: "/images/courses/C6.jpg" },
          ],
        },
        badges: {
          create: [
            { text: "Language", color: "#fff", backgroundColor: "#6e8efb" },
            { text: "In-Person", color: "#fff", backgroundColor: "#28a745" },
            { text: "Beginner", color: "#000", backgroundColor: "#ffc107" },
          ],
        },
        faq: {
          create: [
            {
              question: "Is this course taught in Thai or English?",
              answer:
                "Instruction is primarily in Thai with some English support. Basic proficiency in either language is sufficient.",
            },
            {
              question: "Will we focus on spoken or written Karen?",
              answer:
                "Both aspects are covered, with emphasis on practical spoken communication. Written Karen is introduced gradually throughout the course.",
            },
          ],
        },
        organizationInfo: {
          create: {
            name: "Karen Cultural Preservation Association",
            description:
              "Dedicated to preserving and sharing Karen language, culture, and traditions in Thailand's border communities.",
            phone: "+66 55 444 5555",
            email: "learn@karenlanguage.org",
            address: "28 Heritage Road, Mae Sot, Tak Province 63110, Thailand",
            facebookPage: "https://facebook.com/karenlanguage",
            latitude: 16.7135,
            longitude: 98.5705,
          },
        },
      },
    });
    console.log("Added Course 21:", course21.title);

    // Course 22: Motorcycle Maintenance and Repair
    const course22 = await prisma.course.create({
      data: {
        id: "course22",
        title: "Motorcycle Maintenance and Repair",
        subtitle: "Essential Skills for Riders",
        location: "Mae Sot Technical College",
        startDate: "July 10, 2025",
        duration: "8 weeks",
        schedule: "Tue, Thu: 5:00 PM - 7:30 PM",
        fee: "3,200 THB",
        availableDays: [false, false, true, false, true, false, false],
        description:
          "Learn practical motorcycle maintenance and repair skills for the most common motorbikes in Thailand, focusing on safety and cost-saving DIY repairs.",
        outcomes: [
          "Perform routine maintenance tasks like oil changes and brake adjustments",
          "Diagnose common engine and electrical problems",
          "Complete basic repairs independently",
          "Understand motorcycle safety and proper maintenance schedules",
        ],
        scheduleDetails:
          "Two evening sessions per week with hands-on practice on real motorcycles. Final session includes supervised repairs of participants' own bikes.",
        selectionCriteria: [
          "Basic mechanical aptitude helpful but not required",
          "Must be 16 years or older",
          "Motorcycle ownership recommended but not required",
        ],
        images: {
          create: [
            { url: "/images/courses/C4.jpg" },
            { url: "/images/courses/C3.jpg" },
            { url: "/images/courses/C6.jpg" },
          ],
        },
        badges: {
          create: [
            { text: "Vocational", color: "#fff", backgroundColor: "#6610f2" },
            { text: "In-Person", color: "#fff", backgroundColor: "#28a745" },
          ],
        },
        faq: {
          create: [
            {
              question: "Do I need to bring my own motorcycle?",
              answer:
                "For most sessions, we provide practice motorcycles. However, for the final session, you're encouraged to bring your own bike for specific repair guidance.",
            },
            {
              question: "What types of motorcycles will be covered?",
              answer:
                "We focus on the most common models in Thailand, including Honda Wave, Yamaha Fino, and similar small displacement motorcycles.",
            },
          ],
        },
      },
    });
    console.log("Added Course 22:", course22.title);

    // Course 23: Herbal Medicine and Traditional Healing
    const course23 = await prisma.course.create({
      data: {
        id: "course23",
        title: "Herbal Medicine and Traditional Healing",
        subtitle: "Local Plant Wisdom for Health",
        location: "Mae Sot Community Garden",
        startDate: "August 25, 2025",
        duration: "6 weeks",
        schedule: "Sun: 9:00 AM - 12:00 PM",
        fee: "2,000 THB",
        availableDays: [false, false, false, false, false, false, true],
        description:
          "Explore traditional herbal medicine practices from Thai, Karen, and Burmese healing traditions, with a focus on locally available medicinal plants.",
        outcomes: [
          "Identify common medicinal plants in the region",
          "Prepare basic herbal remedies for common ailments",
          "Understand safe usage and contraindications",
          "Integrate traditional knowledge with modern health practices",
        ],
        scheduleDetails:
          "Sunday morning sessions including classroom learning, garden walks, and hands-on preparation of remedies. Includes one herb-gathering field trip.",
        selectionCriteria: [
          "Interest in traditional medicine and plant knowledge",
          "Open to adults of all ages",
          "No prior botanical knowledge required",
        ],
        images: {
          create: [
            { url: "/images/courses/C3.jpg" },
            { url: "/images/courses/C1.jpg" },
            { url: "/images/courses/C5.jpg" },
          ],
        },
        badges: {
          create: [
            { text: "In-Person", color: "#fff", backgroundColor: "#28a745" },
            { text: "Beginner", color: "#000", backgroundColor: "#ffc107" },
          ],
        },
        faq: {
          create: [
            {
              question: "Is this course scientific or traditional?",
              answer:
                "The course respects traditional knowledge while incorporating scientific understanding where available. We emphasize safe usage and appropriate integration with modern healthcare.",
            },
            {
              question: "Will we make remedies to take home?",
              answer:
                "Yes, each session includes preparation of remedies that participants can take home, along with detailed usage instructions.",
            },
          ],
        },
        organizationInfo: {
          create: {
            name: "Traditional Healing Knowledge Network",
            description:
              "Preserving and sharing traditional healing practices while promoting safe integration with modern healthcare.",
            phone: "+66 55 666 7777",
            email: "herbs@traditionalhealing.org",
            address: "95 Garden Road, Mae Sot, Tak Province 63110, Thailand",
            facebookPage: "https://facebook.com/traditionalhealing",
            latitude: 16.7195,
            longitude: 98.567,
          },
        },
      },
    });
    console.log("Added Course 23:", course23.title);

    // Course 24: Graphic Design Fundamentals
    const course24 = await prisma.course.create({
      data: {
        id: "course24",
        title: "Graphic Design Fundamentals",
        subtitle: "Creative Visual Communication",
        location: "Mae Sot Digital Arts Lab",
        startDate: "September 3, 2025",
        duration: "8 weeks",
        schedule: "Wed, Fri: 6:00 PM - 8:00 PM",
        fee: "3,500 THB",
        availableDays: [false, false, false, true, false, true, false],
        description:
          "Learn the foundations of graphic design including design principles, color theory, typography, and basic digital design tools.",
        outcomes: [
          "Apply fundamental design principles to create effective visuals",
          "Use free design software with confidence",
          "Create basic promotional materials like flyers, posters, and social media graphics",
          "Develop a starter portfolio of design projects",
        ],
        scheduleDetails:
          "Evening sessions twice weekly with guided exercises and independent project work. Computer lab available for additional practice hours.",
        selectionCriteria: [
          "Basic computer skills required",
          "No prior design experience needed",
          "Ages 15 and above welcome",
        ],
        images: {
          create: [
            { url: "/images/courses/C6.jpg" },
            { url: "/images/courses/C2.jpg" },
            { url: "/images/courses/C4.jpg" },
          ],
        },
        badges: {
          create: [
            { text: "Technology", color: "#fff", backgroundColor: "#007bff" },
            { text: "In-Person", color: "#fff", backgroundColor: "#28a745" },
            { text: "Beginner", color: "#000", backgroundColor: "#ffc107" },
          ],
        },
        faq: {
          create: [
            {
              question: "Do I need my own laptop?",
              answer:
                "We provide computers during class sessions. Having your own computer is beneficial for practice but not required.",
            },
            {
              question: "What software will we use?",
              answer:
                "We focus on free and open-source alternatives including GIMP, Inkscape, and Canva that you can continue using after the course without subscription fees.",
            },
          ],
        },
      },
    });
    console.log("Added Course 24:", course24.title);

    // Course 25: Financial Literacy for Families
    const course25 = await prisma.course.create({
      data: {
        id: "course25",
        title: "Financial Literacy for Families",
        subtitle: "Building Sustainable Household Finances",
        location: "Mae Sot Community Center",
        startDate: "July 8, 2025",
        duration: "4 weeks",
        schedule: "Sat: 10:00 AM - 12:00 PM",
        fee: "Free",
        availableDays: [false, false, false, false, false, false, true],
        description:
          "Practical financial education for families, covering budgeting, saving, debt management, and planning for future expenses.",
        outcomes: [
          "Create and maintain a household budget",
          "Develop effective saving strategies",
          "Manage debt and avoid predatory lending",
          "Plan for significant expenses like education and emergencies",
        ],
        scheduleDetails:
          "Weekly Saturday morning sessions with practical exercises and personalized guidance. Optional one-on-one financial counseling available.",
        selectionCriteria: [
          "Open to adults of all backgrounds",
          "Basic numeracy skills required",
          "Families encouraged to attend together when possible",
        ],
        images: {
          create: [
            { url: "/images/courses/C5.jpg" },
            { url: "/images/courses/C1.jpg" },
            { url: "/images/courses/C3.jpg" },
          ],
        },
        badges: {
          create: [
            { text: "Free", color: "#fff", backgroundColor: "#dc3545" },
            { text: "In-Person", color: "#fff", backgroundColor: "#28a745" },
          ],
        },
        faq: {
          create: [
            {
              question: "Do I need to share my personal financial information?",
              answer:
                "No, all exercises can be completed with example figures. Your privacy is respected, and no personal financial details need to be shared.",
            },
            {
              question: "Is this course only for low-income families?",
              answer:
                "No, this course is designed for families of all income levels who want to improve their financial management skills.",
            },
          ],
        },
        organizationInfo: {
          create: {
            name: "Financial Empowerment Network",
            description:
              "Promoting financial literacy and economic stability for families in the border region.",
            phone: "+66 55 123 9876",
            email: "learn@financialempowerment.org",
            address:
              "77 Community Plaza, Mae Sot, Tak Province 63110, Thailand",
            facebookPage: "https://facebook.com/financialempowerment",
            latitude: 16.716,
            longitude: 98.5695,
          },
        },
      },
    });
    console.log("Added Course 25:", course25.title);

    // Course 26: Soap and Natural Products Making
    const course26 = await prisma.course.create({
      data: {
        id: "course26",
        title: "Soap and Natural Products Making",
        subtitle: "Crafting for Home and Business",
        location: "Mae Sot Craft Center",
        startDate: "July 15, 2025",
        duration: "5 weeks",
        schedule: "Thu: 1:00 PM - 4:00 PM",
        fee: "2,200 THB (includes materials)",
        availableDays: [false, false, false, false, true, false, false],
        description:
          "Learn to make handcrafted soaps and natural body products using local ingredients, with potential for home use or small business development.",
        outcomes: [
          "Create various types of soap using different methods",
          "Formulate natural lotions, balms, and scrubs",
          "Source ingredients sustainably and affordably",
          "Understand basic business concepts for craft sales",
        ],
        scheduleDetails:
          "Weekly afternoon workshops with hands-on production. All materials provided, and participants take home products from each session.",
        selectionCriteria: [
          "Open to adults and teens (16+)",
          "No prior experience required",
          "Must follow safety procedures when working with ingredients",
        ],
        images: {
          create: [
            { url: "/images/courses/C2.jpg" },
            { url: "/images/courses/C5.jpg" },
            { url: "/images/courses/C4.jpg" },
          ],
        },
        badges: {
          create: [
            { text: "Vocational", color: "#fff", backgroundColor: "#6610f2" },
            { text: "In-Person", color: "#fff", backgroundColor: "#28a745" },
          ],
        },
        faq: {
          create: [
            {
              question: "Is soap making dangerous?",
              answer:
                "We teach safe methods and provide all necessary safety equipment. While some ingredients require careful handling, proper procedures make the process safe.",
            },
            {
              question: "Can I start a business with these skills?",
              answer:
                "Yes, many graduates have started small soap and natural product businesses. The course includes basic information on pricing, packaging, and local regulations.",
            },
          ],
        },
      },
    });
    console.log("Added Course 26:", course26.title);

    // Course 27 continued
    const course27 = await prisma.course.create({
      data: {
        id: "course27",
        title: "Community Basketball Program",
        subtitle: "Skills, Teamwork, and Fitness",
        location: "Mae Sot Sports Complex",
        startDate: "Ongoing - Join Anytime",
        duration: "Ongoing",
        schedule: "Tue, Thu: 4:00 PM - 6:00 PM",
        fee: "500 THB per month",
        availableDays: [false, false, true, false, true, false, false],
        description:
          "A recreational and instructional basketball program focusing on skills development, teamwork, and physical fitness for youth and adults.",
        outcomes: [
          "Develop fundamental basketball skills",
          "Improve physical fitness and coordination",
          "Build teamwork and sportsmanship values",
          "Participate in friendly community competitions",
        ],
        scheduleDetails:
          "Two practice sessions per week with a mix of skills training and gameplay. Monthly mini-tournaments with other community teams.",
        selectionCriteria: [
          "Open to ages 12 and up (separate youth and adult groups)",
          "All skill levels welcome from beginner to experienced",
          "Commitment to regular attendance and positive sportsmanship",
        ],
        images: {
          create: [
            { url: "/images/courses/C3.jpg" },
            { url: "/images/courses/C6.jpg" },
            { url: "/images/courses/C1.jpg" },
          ],
        },
        badges: {
          create: [
            { text: "In-Person", color: "#fff", backgroundColor: "#28a745" },
            { text: "Beginner", color: "#000", backgroundColor: "#ffc107" },
          ],
        },
        faq: {
          create: [
            {
              question: "Do I need to have played basketball before?",
              answer:
                "No, we welcome complete beginners and provide fundamental skills training for those new to the sport.",
            },
            {
              question: "What should I bring to sessions?",
              answer:
                "Comfortable athletic clothing, sports shoes, and a water bottle. Basketballs are provided, but you're welcome to bring your own.",
            },
          ],
        },
      },
    });
    console.log("Added Course 27:", course27.title);

    // Course 28: Basic Carpentry and Woodworking
    const course28 = await prisma.course.create({
      data: {
        id: "course28",
        title: "Basic Carpentry and Woodworking",
        subtitle: "Practical Furniture Making Skills",
        location: "Mae Sot Technical Center",
        startDate: "August 3, 2025",
        duration: "10 weeks",
        schedule: "Sat: 9:00 AM - 1:00 PM",
        fee: "4,000 THB (includes materials)",
        availableDays: [false, false, false, false, false, false, true],
        description:
          "Learn fundamental carpentry and woodworking skills to create functional furniture and household items using basic tools and local materials.",
        outcomes: [
          "Use hand and power tools safely and effectively",
          "Read and create basic woodworking plans",
          "Complete simple furniture projects independently",
          "Apply proper finishing techniques for wood items",
        ],
        scheduleDetails:
          "Weekly four-hour hands-on workshop sessions. Each participant will complete at least three take-home projects during the course.",
        selectionCriteria: [
          "Adults 18 and over",
          "No prior woodworking experience required",
          "Must follow safety protocols at all times",
        ],
        images: {
          create: [
            { url: "/images/courses/C4.jpg" },
            { url: "/images/courses/C2.jpg" },
            { url: "/images/courses/C5.jpg" },
          ],
        },
        badges: {
          create: [
            { text: "Vocational", color: "#fff", backgroundColor: "#6610f2" },
            { text: "In-Person", color: "#fff", backgroundColor: "#28a745" },
          ],
        },
        faq: {
          create: [
            {
              question: "What will I make during the course?",
              answer:
                "Projects typically include a small shelf, a stool or side table, and a customized final project of your choice such as a storage box or wall unit.",
            },
            {
              question: "Is this course physically demanding?",
              answer:
                "Some aspects require moderate physical activity. We can accommodate most physical limitations with adjusted techniques or tools.",
            },
          ],
        },
      },
    });
    console.log("Added Course 28:", course28.title);

    // Course 29: Traditional Dance Workshop
    const course29 = await prisma.course.create({
      data: {
        id: "course29",
        title: "Traditional Dance Workshop",
        subtitle: "Cultural Movement and Expression",
        location: "Mae Sot Cultural Center",
        startDate: "July 22, 2025",
        duration: "8 weeks",
        schedule: "Sun: 2:00 PM - 4:00 PM",
        fee: "1,800 THB",
        availableDays: [false, false, false, false, false, false, true],
        description:
          "Explore traditional dance forms from Thai, Karen, and Burmese cultures, learning the movements, meanings, and music that define these rich cultural expressions.",
        outcomes: [
          "Master basic movement patterns from different traditional dances",
          "Understand the cultural context and significance of each dance form",
          "Perform simple dance sequences as part of a group",
          "Appreciate the history and evolution of regional dance traditions",
        ],
        scheduleDetails:
          "Weekly Sunday afternoon sessions with instruction and practice. Final session includes a small community performance showcase.",
        selectionCriteria: [
          "Open to all ages 12 and above",
          "No dance experience required",
          "All fitness levels welcome, adaptations available as needed",
        ],
        images: {
          create: [
            { url: "/images/courses/C5.jpg" },
            { url: "/images/courses/C1.jpg" },
            { url: "/images/courses/C6.jpg" },
          ],
        },
        badges: {
          create: [
            { text: "In-Person", color: "#fff", backgroundColor: "#28a745" },
            { text: "Beginner", color: "#000", backgroundColor: "#ffc107" },
          ],
        },
        faq: {
          create: [
            {
              question: "Do I need special clothing or shoes?",
              answer:
                "Comfortable, loose-fitting clothes are recommended. Traditional costume elements will be provided for the performance. Dancing is typically done barefoot or in simple flat shoes.",
            },
            {
              question: "Will we focus on one dance tradition or multiple?",
              answer:
                "The course explores several regional dance traditions, with time spent on each based on the group's interests. Everyone will learn elements from at least three different cultural dance forms.",
            },
          ],
        },
        organizationInfo: {
          create: {
            name: "Border Region Cultural Arts Association",
            description:
              "Preserving and celebrating the diverse cultural arts traditions of the Thailand-Myanmar border region.",
            phone: "+66 55 987 1234",
            email: "arts@borderculture.org",
            address: "15 Cultural Lane, Mae Sot, Tak Province 63110, Thailand",
            facebookPage: "https://facebook.com/borderculture",
            latitude: 16.7155,
            longitude: 98.5708,
          },
        },
      },
    });
    console.log("Added Course 29:", course29.title);

    // Course 30: Speech and Presentation Skills
    const course30 = await prisma.course.create({
      data: {
        id: "course30",
        title: "Speech and Presentation Skills",
        subtitle: "Effective Public Communication",
        location: "Mae Sot Business Center",
        startDate: "September 5, 2025",
        duration: "6 weeks",
        schedule: "Fri: 6:00 PM - 8:30 PM",
        fee: "2,500 THB",
        availableDays: [false, false, false, false, false, true, false],
        description:
          "Develop confidence and skills for public speaking, presentations, and professional communication in multiple languages.",
        outcomes: [
          "Overcome nervousness and speak with confidence",
          "Structure presentations for maximum impact",
          "Use visual aids effectively",
          "Handle questions and adapt to different audiences",
        ],
        scheduleDetails:
          "Weekly Friday evening sessions with practice speeches and constructive feedback. Final session includes a formal presentation to a supportive audience.",
        selectionCriteria: [
          "Open to adults and older teens (16+)",
          "Suitable for beginners and those with public speaking anxiety",
          "Participants should be comfortable in at least one of: Thai, English, or Burmese",
        ],
        images: {
          create: [
            { url: "/images/courses/C2.jpg" },
            { url: "/images/courses/C6.jpg" },
            { url: "/images/courses/C3.jpg" },
          ],
        },
        badges: {
          create: [
            { text: "In-Person", color: "#fff", backgroundColor: "#28a745" },
          ],
        },
        faq: {
          create: [
            {
              question:
                "I'm terrified of public speaking. Is this course still suitable for me?",
              answer:
                "Absolutely! Many participants start with significant anxiety. We create a supportive environment and build skills gradually to help overcome fear.",
            },
            {
              question: "Can I give presentations in my preferred language?",
              answer:
                "Yes, you can practice in Thai, English, Burmese, or Karen. Our instructors can provide feedback in most regional languages.",
            },
          ],
        },
      },
    });
    console.log("Added Course 30:", course30.title);

    // Course 31: Urban Gardening Workshop
    const course31 = await prisma.course.create({
      data: {
        id: "course31",
        title: "Urban Gardening Workshop",
        subtitle: "Grow Food in Limited Spaces",
        location: "Mae Sot Community Garden",
        startDate: "August 10, 2025",
        duration: "4 weeks",
        schedule: "Sat: 8:00 AM - 10:00 AM",
        fee: "1,200 THB (includes starter materials)",
        availableDays: [false, false, false, false, false, false, true],
        description:
          "Learn techniques for growing vegetables, herbs, and edible plants in small urban spaces using containers, vertical gardening, and space-efficient methods.",
        outcomes: [
          "Design productive gardens for balconies, patios, or small yards",
          "Grow vegetables and herbs in containers",
          "Create and maintain vertical growing systems",
          "Harvest, save seeds, and maintain continuous production",
        ],
        scheduleDetails:
          "Weekly Saturday morning sessions with hands-on activities. Includes starter plants and containers to begin your garden.",
        selectionCriteria: [
          "Open to all ages and experience levels",
          "No garden space required – suitable for apartment dwellers",
          "Interest in growing food and sustainability",
        ],
        images: {
          create: [
            { url: "/images/courses/C1.jpg" },
            { url: "/images/courses/C4.jpg" },
            { url: "/images/courses/C3.jpg" },
          ],
        },
        badges: {
          create: [
            { text: "In-Person", color: "#fff", backgroundColor: "#28a745" },
            { text: "Beginner", color: "#000", backgroundColor: "#ffc107" },
          ],
        },
        faq: {
          create: [
            {
              question:
                "I have no gardening experience at all. Can I still participate?",
              answer:
                "Yes! This course is designed for complete beginners. We start with the basics and focus on simple, successful methods.",
            },
            {
              question:
                "I live in an apartment with only a small balcony. Will this work for me?",
              answer:
                "Absolutely. We specifically focus on methods for very small spaces, including container gardening, vertical systems, and windowsill herbs.",
            },
          ],
        },
      },
    });
    console.log("Added Course 31:", course31.title);

    // Course 32: Parenting Skills Workshop
    const course32 = await prisma.course.create({
      data: {
        id: "course32",
        title: "Parenting Skills Workshop",
        subtitle: "Positive Approaches to Child Raising",
        location: "Mae Sot Family Center",
        startDate: "September 12, 2025",
        duration: "6 weeks",
        schedule: "Fri: 10:00 AM - 12:00 PM",
        fee: "Free",
        availableDays: [false, false, false, false, false, true, false],
        description:
          "Evidence-based approaches to positive parenting, discipline, communication, and child development for parents and caregivers.",
        outcomes: [
          "Apply positive discipline techniques appropriate to different ages",
          "Communicate effectively with children and teenagers",
          "Understand developmental stages and appropriate expectations",
          "Manage parenting stress and build family resilience",
        ],
        scheduleDetails:
          "Weekly morning sessions with practical strategies, role-playing, and group discussion. Childcare provided during class time.",
        selectionCriteria: [
          "Parents, grandparents, and caregivers of children of any age",
          "Open to pregnant women and expectant parents",
          "Limited to 15 participants per group",
        ],
        images: {
          create: [
            { url: "/images/courses/C5.jpg" },
            { url: "/images/courses/C2.jpg" },
            { url: "/images/courses/C6.jpg" },
          ],
        },
        badges: {
          create: [
            { text: "Free", color: "#fff", backgroundColor: "#dc3545" },
            { text: "In-Person", color: "#fff", backgroundColor: "#28a745" },
          ],
        },
        faq: {
          create: [
            {
              question: "Is childcare really provided?",
              answer:
                "Yes, free childcare is available during the workshop sessions. Please register your children in advance so we can ensure appropriate staffing.",
            },
            {
              question:
                "My child has special needs. Will this course still be helpful?",
              answer:
                "Yes, while we cover general principles, we also address parenting children with different needs and temperaments. Individual questions are welcome.",
            },
          ],
        },
        organizationInfo: {
          create: {
            name: "Mae Sot Family Support Network",
            description:
              "Supporting families through education, resources, and community connections in the border region.",
            phone: "+66 55 432 1098",
            email: "families@maesotfamily.org",
            address: "88 Family Street, Mae Sot, Tak Province 63110, Thailand",
            facebookPage: "https://facebook.com/maesotfamily",
            latitude: 16.7185,
            longitude: 98.5715,
          },
        },
      },
    });
    console.log("Added Course 32:", course32.title);

    // Course 33: Disaster Preparedness Training
    const course33 = await prisma.course.create({
      data: {
        id: "course33",
        title: "Disaster Preparedness Training",
        subtitle: "Community Resilience Planning",
        location: "Mae Sot Emergency Response Center",
        startDate: "July 25, 2025",
        duration: "3 weeks",
        schedule: "Sat: 9:00 AM - 12:00 PM",
        fee: "Free",
        availableDays: [false, false, false, false, false, false, true],
        description:
          "Essential training for preparing households and communities for natural disasters common to the region, including floods, landslides, and earthquakes.",
        outcomes: [
          "Create household and neighborhood emergency plans",
          "Assemble appropriate emergency kits",
          "Understand early warning systems and evacuation procedures",
          "Perform basic disaster response actions safely",
        ],
        scheduleDetails:
          "Three Saturday morning sessions including classroom instruction, practical exercises, and a community mapping activity.",
        selectionCriteria: [
          "Open to adults from all communities",
          "Community leaders and volunteers especially encouraged",
          "Willingness to share information with neighbors and family",
        ],
        images: {
          create: [
            { url: "/images/courses/C3.jpg" },
            { url: "/images/courses/C6.jpg" },
            { url: "/images/courses/C4.jpg" },
          ],
        },
        badges: {
          create: [
            { text: "Free", color: "#fff", backgroundColor: "#dc3545" },
            {
              text: "Certification",
              color: "#fff",
              backgroundColor: "#17a2b8",
            },
          ],
        },
        faq: {
          create: [
            {
              question: "Is this only about floods?",
              answer:
                "No, while flooding is common in our region, we cover multiple disaster types including earthquakes, landslides, severe storms, and fire safety.",
            },
            {
              question: "Will I receive any emergency supplies?",
              answer:
                "Participants receive a starter emergency kit and detailed guides for expanding their household preparations affordably.",
            },
          ],
        },
      },
    });
    console.log("Added Course 33:", course33.title);

    // Course 34: Jewelry Making Basics
    const course34 = await prisma.course.create({
      data: {
        id: "course34",
        title: "Jewelry Making Basics",
        subtitle: "Create Handcrafted Accessories",
        location: "Mae Sot Craft Center",
        startDate: "August 18, 2025",
        duration: "6 weeks",
        schedule: "Mon: 1:00 PM - 3:30 PM",
        fee: "2,500 THB (includes starter materials)",
        availableDays: [false, true, false, false, false, false, false],
        description:
          "Learn fundamental jewelry making techniques using local materials and simple tools to create unique accessories for personal use or small business opportunities.",
        outcomes: [
          "Master basic jewelry construction techniques",
          "Work with various materials including beads, wire, and natural elements",
          "Design original pieces with cultural influences",
          "Complete multiple wearable projects to take home",
        ],
        scheduleDetails:
          "Weekly afternoon sessions with hands-on creation time. All tools and starter materials provided.",
        selectionCriteria: [
          "Open to adults and teens (14+)",
          "No prior experience needed",
          "Good fine motor skills helpful but not required",
        ],
        images: {
          create: [
            { url: "/images/courses/C2.jpg" },
            { url: "/images/courses/C5.jpg" },
            { url: "/images/courses/C1.jpg" },
          ],
        },
        badges: {
          create: [
            { text: "Vocational", color: "#fff", backgroundColor: "#6610f2" },
            { text: "In-Person", color: "#fff", backgroundColor: "#28a745" },
            { text: "Beginner", color: "#000", backgroundColor: "#ffc107" },
          ],
        },
        faq: {
          create: [
            {
              question: "What kinds of jewelry will we make?",
              answer:
                "Projects typically include earrings, bracelets, necklaces, and small decorative items, incorporating techniques like beading, wire work, and simple metal forming.",
            },
            {
              question: "Can I sell the jewelry I make?",
              answer:
                "Absolutely! We discuss small business basics including pricing, photography, and local selling opportunities as part of the course.",
            },
          ],
        },
      },
    });
    console.log("Added Course 34:", course34.title);

    console.log("Successfully added all courses!");
  } catch (error) {
    console.error("Error adding courses:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addCourses().catch((e) => {
  console.error(e);
  process.exit(1);
});
