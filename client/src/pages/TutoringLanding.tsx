import { Calendar, Users, DollarSign, Smartphone, Repeat, BarChart3, Clock, BookOpen, Video, Globe } from "lucide-react";
import IndustryLandingTemplate, { type IndustryConfig } from "./components/IndustryLandingTemplate";
import TutoringHeroVideo from "./components/TutoringHeroVideo";

const config: IndustryConfig = {
  badge: "📚 Built for Tutors & Educators",
  headlineLine1: "Your Students.",
  headlineLine2: "Always Learning.",
  subheadline: "Certxa lets students and parents book sessions online, manages your weekly schedule, sends automatic reminders, and handles payment — so you can focus on teaching, not logistics.",
  heroVideo: <TutoringHeroVideo />,
  trustText: "Trusted by thousands of tutors and educators",
  competitors: ["Calendly Alternative", "Acuity Alternative", "TutorBird Alternative"],
  stats: [
    { value: "7,000+", label: "Tutors & Educators" },
    { value: "350K+",  label: "Sessions Booked" },
    { value: "93%",    label: "Student Retention" },
    { value: "4.9★",   label: "Average Rating" },
  ],
  featuresLabel: "BUILT FOR TUTORS",
  featuresTitle: "Everything Your Tutoring Business Needs",
  featuresSubtitle: "Spend more time teaching and less time coordinating schedules and chasing payments.",
  features: [
    { icon: <Calendar className="w-6 h-6 text-[#00D4AA]" />,   title: "Online Session Booking",          desc: "Students and parents book sessions from your public booking link. They pick the subject, session length, and available time slot — everything lands on your calendar automatically." },
    { icon: <Repeat className="w-6 h-6 text-[#00D4AA]" />,     title: "Weekly Recurring Sessions",       desc: "Lock in weekly or bi-weekly students with recurring bookings. Your regulars stay on the calendar for the whole semester without re-booking every week." },
    { icon: <BookOpen className="w-6 h-6 text-[#00D4AA]" />,   title: "Student Profiles & Progress Notes", desc: "Track each student's subject, grade level, strengths, weaknesses, and session notes in their profile. Walk into every lesson knowing exactly where they left off." },
    { icon: <Smartphone className="w-6 h-6 text-[#00D4AA]" />, title: "Session Reminders",               desc: "Automated reminders to students and parents before every session. Dramatically reduce no-shows and last-minute cancellations without a single manual text." },
    { icon: <DollarSign className="w-6 h-6 text-[#00D4AA]" />, title: "Session Invoicing & Payments",    desc: "Charge per session, per hour, or sell session packages. Clients pay by card online. No more awkward conversations about payment or waiting to be paid." },
    { icon: <Video className="w-6 h-6 text-[#00D4AA]" />,      title: "In-Person & Online Sessions",     desc: "Offer both in-home tutoring and virtual sessions. Students pick their preferred format when booking. Your calendar handles both without any extra setup." },
    { icon: <Clock className="w-6 h-6 text-[#00D4AA]" />,      title: "Availability Management",         desc: "Set your weekly available hours and blocked times. Students can only book when you're actually free — no more back-and-forth to find a slot that works." },
    { icon: <Users className="w-6 h-6 text-[#00D4AA]" />,      title: "Student & Parent Contacts",       desc: "Store parent and student contact details, grade level, school, and session preferences in one organized profile. No more digging through text threads." },
    { icon: <BarChart3 className="w-6 h-6 text-[#00D4AA]" />,  title: "Income Reports",                  desc: "See your total sessions, revenue per week or month, and most-booked subjects. Understand which parts of your tutoring business are growing fastest." },
  ],
  featureTabs: [
    {
      label: "Scheduling",
      icon: <Calendar className="w-4 h-4" />,
      heading: "Your teaching schedule, sorted for the whole week",
      subheading: "Set your available hours, lock in recurring students, and never double-book again.",
      bullets: [
        "Set weekly availability so students only see open slots when booking",
        "Recurring sessions for weekly students automatically carry forward each week",
        "Separate calendars for in-person and online sessions if needed",
      ],
      mockType: "calendar",
    },
    {
      label: "Online Booking",
      icon: <Globe className="w-4 h-4" />,
      heading: "Parents book without the email back-and-forth",
      subheading: "Share your link with school families, post in community groups, and new students book instantly.",
      bullets: [
        "Students and parents pick subject, session length, and time slot themselves",
        "Instant confirmation text to both parent and student upon booking",
        "Online and in-person session options selectable at booking time",
      ],
      mockType: "booking",
    },
    {
      label: "Invoicing",
      icon: <DollarSign className="w-4 h-4" />,
      heading: "Get paid for every session — no more chasing",
      subheading: "Charge per session, sell packages, or set up monthly billing — all handled automatically.",
      bullets: [
        "Sell session packages (e.g., 8-session SAT prep bundle) upfront",
        "Per-session invoices sent automatically after each appointment",
        "Monthly billing option for students on regular weekly schedules",
      ],
      mockType: "invoice",
    },
    {
      label: "Client Management",
      icon: <Users className="w-4 h-4" />,
      heading: "Walk into every session fully prepared",
      subheading: "Each student profile holds their progress notes, session history, and parent contacts.",
      bullets: [
        "Session notes and homework assigned logged per student after each visit",
        "Track attendance, consistency, and progress across the semester",
        "Parent contact info and communication preferences stored per family",
      ],
      mockType: "clients",
    },
    {
      label: "SMS Reminders",
      icon: <Smartphone className="w-4 h-4" />,
      heading: "Zero no-shows from students or parents",
      subheading: "Automatic texts to both parent and student before every session.",
      bullets: [
        "Session reminders sent 24 hours and 1 hour before each appointment",
        "Parents can confirm, reschedule, or cancel via text reply",
        "Post-session follow-ups with homework summary or progress notes",
      ],
      mockType: "sms",
    },
  ],
  howItWorksSteps: [
    { step: "01", title: "Set Up Your Tutor Profile",  desc: "Add your subjects, session lengths, hourly rate or package pricing, and available hours. Our tutoring onboarding fills in common subjects and session types automatically." },
    { step: "02", title: "Share Your Booking Link",    desc: "Share it with school parents, post on community boards, add to your teacher profile, or put it in your email signature. Students book sessions without back-and-forth." },
    { step: "03", title: "Teach, Track, and Get Paid", desc: "Show up to confirmed sessions, log notes and progress afterward, and collect payment automatically. Your tutoring business runs like clockwork." },
  ],
  testimonials: [
    { quote: "Parents used to text me at all hours to schedule sessions. Now they just book online and I get a notification. My personal time actually feels personal again.", name: "Sarah K.", role: "Math & Science Tutor" },
    { quote: "The student progress notes are something I didn't know I needed. Walking into every session knowing exactly where the student is at has made me a better tutor.", name: "Michael P.", role: "SAT Prep Specialist" },
    { quote: "Online payments changed everything. I used to forget to collect half the time. Now it's automatic and I make 30% more per month just from not letting sessions slip by unpaid.", name: "Nia J.", role: "Reading & Writing Coach" },
  ],
  compareTitle: "Why Tutors Choose Certxa",
  compareSubtitle: "Purpose-built for independent tutors and small teaching practices.",
  compareRows: [
    ["Weekly recurring session booking",       true,  false],
    ["Student progress notes & history",       true,  false],
    ["In-person & online session types",        true,  false],
    ["Automatic parent/student reminders",     true,  false],
    ["Online invoicing & card payments",       true,  false],
    ["Session package pricing",               true,  true ],
    ["Online booking page",                   true,  true ],
    ["60-day free trial",                     true,  false],
  ],
  faqs: [
    { q: "Can students or parents book sessions without creating an account?", a: "Yes. Clients book through a simple web link — no app or account needed. It works on any phone or computer." },
    { q: "Can I sell session packages instead of billing per session?", a: "Yes. You can offer packages like '10 sessions for $X' and Certxa tracks how many sessions remain. Great for test prep courses or semester-long programs." },
    { q: "Do I have to offer online tutoring, or can I be in-person only?", a: "You choose. You can offer in-person sessions only, online sessions only, or let students pick their format at booking. Certxa handles both types of appointments." },
    { q: "How do I handle recurring weekly students?", a: "Set up any student as a recurring weekly booking and they stay on your calendar automatically every week. No re-booking required for the rest of the semester." },
    { q: "Can I store notes from each tutoring session?", a: "Yes. Each student profile has a notes section where you can log what was covered, homework assigned, and where to pick up next time." },
    { q: "What if a student needs to reschedule?", a: "Parents or students can request a reschedule through their confirmation text link. You'll be notified and can approve a new time with one tap." },
  ],
  ctaHeadline: "Ready to Fill Your Teaching Schedule?",
  ctaSub: "Start your 60-day free trial. No credit card required. Cancel any time.",
  ctaContext: "Join thousands of tutors already using Certxa to grow their practice.",
};

export default function TutoringLanding() {
  return <IndustryLandingTemplate config={config} />;
}
