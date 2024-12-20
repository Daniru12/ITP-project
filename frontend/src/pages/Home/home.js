import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import {
  BookOpen,
  Users,
  GraduationCap,
  Globe,
  Trophy,
  Building2,
  Globe2,
  ChevronLeft,
  ChevronRight,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Calendar,
  MessageSquare,
} from "lucide-react";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Primary Colors
const colors = {
  primary: {
    DEFAULT: "#2563EB", // Bright Blue - for main CTAs and important elements
    light: "#3B82F6", // Light Blue - for hover states
    dark: "#1D4ED8", // Dark Blue - for active states
  },
  secondary: {
    DEFAULT: "#4B5563", // Slate Gray - for secondary text
    light: "#9CA3AF", // Light Gray - for disabled states
    dark: "#374151", // Dark Gray - for headings
  },
  accent: {
    DEFAULT: "#F59E0B", // Amber - for accent elements and highlights
    light: "#FBBF24", // Light Amber - for hover states
    dark: "#D97706", // Dark Amber - for active states
  },
  background: {
    primary: "#FFFFFF", // White - main background
    secondary: "#F3F4F6", // Light Gray - secondary background
    tertiary: "#E5E7EB", // Slightly Darker Gray - tertiary background
  },
};

// Add this data near your other constants
const analyticsData = {
  monthlyActivity: [
    { month: "Jan", students: 4000, courses: 2400, events: 1800 },
    { month: "Feb", students: 4500, courses: 2600, events: 2200 },
    { month: "Mar", students: 5000, courses: 2900, events: 2400 },
    { month: "Apr", students: 4800, courses: 2700, events: 2100 },
    { month: "May", students: 5200, courses: 3100, events: 2600 },
    { month: "Jun", students: 5800, courses: 3400, events: 2900 },
  ],
  courseDistribution: [
    { name: "Computer Science", value: 400 },
    { name: "Business", value: 300 },
    { name: "Engineering", value: 300 },
    { name: "Arts", value: 200 },
  ],
  studentProgress: [
    { week: "W1", completion: 65 },
    { week: "W2", completion: 72 },
    { week: "W3", completion: 78 },
    { week: "W4", completion: 85 },
    { week: "W5", completion: 82 },
    { week: "W6", completion: 88 },
  ],
};

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b z-10 relative">
        {/* Logo */}
        <a href="/" className="text-2xl font-bold text-gray-900">
          UniConnect
        </a>

        {/* Main Navigation */}
        <nav className="hidden md:flex items-center gap-12">
          <a
            href="/"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Home
          </a>
          <a
            href="/books"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Books
          </a>
          <a
            href="/events"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Events
          </a>
          <a
            href="/about"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            About
          </a>
          <a
            href="/contact"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Contact
          </a>
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Search Button */}
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>

          {/* Cart Button */}
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              2
            </span>
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() =>
                document
                  .getElementById("profile-dropdown")
                  .classList.toggle("hidden")
              }
            >
              <img
                src="https://picsum.photos/32/32"
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="hidden md:block text-gray-700">John Doe</span>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>

            <div
              id="profile-dropdown"
              className="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border z-50"
            >
              <a
                href="/profile"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User className="w-4 h-4" />
                Profile
              </a>
              <a
                href="/settings"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </a>
              <hr className="my-2" />
              <button
                onClick={() => console.log("Logout clicked")}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-50 transition-colors w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-gray-100 rounded-full"
            onClick={() =>
              document.getElementById("mobile-menu").classList.toggle("hidden")
            }
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <div id="mobile-menu" className="hidden md:hidden border-b bg-white">
        <nav className="px-4 py-2">
          <a href="/" className="block py-2 text-gray-600 hover:text-gray-900">
            Home
          </a>
          <a
            href="/books"
            className="block py-2 text-gray-600 hover:text-gray-900"
          >
            Books
          </a>
          <a
            href="/events"
            className="block py-2 text-gray-600 hover:text-gray-900"
          >
            Events
          </a>
          <a
            href="/about"
            className="block py-2 text-gray-600 hover:text-gray-900"
          >
            About
          </a>
          <a
            href="/contact"
            className="block py-2 text-gray-600 hover:text-gray-900"
          >
            Contact
          </a>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="relative h-[600px] bg-primary-DEFAULT">
        <img
          src="https://picsum.photos/1920/1080"
          alt="Graduates celebrating"
          className="object-cover w-full h-full brightness-50"
        />
        <div className="absolute inset-0 bg-black/50">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in-down">
              Connect, Learn, Succeed
            </h1>
            <p
              className="text-xl md:text-2xl mb-8 max-w-2xl animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              Join our vibrant university community platform where resources
              meet social connectivity
            </p>
            <Button
              size="lg"
              className="bg-accent-DEFAULT hover:bg-accent-light text-white text-lg px-8 animate-fade-in-up"
              style={{ animationDelay: "0.4s" }}
            >
              Get Started
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <h2 className="text-3xl font-bold text-center mb-12 animate-slide-in">
          Why Choose UniConnect
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {[
            {
              icon: BookOpen,
              title: "Digital Library",
              desc: "Access thousands of resources",
            },
            {
              icon: Users,
              title: "Study Groups",
              desc: "Collaborate with peers",
            },
            {
              icon: GraduationCap,
              title: "Expert Faculty",
              desc: "Learn from the best",
            },
            {
              icon: Globe,
              title: "Global Network",
              desc: "Connect worldwide",
            },
            {
              icon: Calendar,
              title: "Event Planning",
              desc: "Organize study sessions",
            },
            {
              icon: MessageSquare,
              title: "Discussion Forums",
              desc: "Engage in meaningful debates",
            },
            {
              icon: Trophy,
              title: "Achievement System",
              desc: "Track your progress",
            },
            {
              icon: Settings,
              title: "Personalization",
              desc: "Customize your experience",
            },
          ].map((feature, i) => (
            <Card
              key={i}
              className="bg-background-secondary hover:shadow-lg transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <CardContent className="p-6">
                <feature.icon className="w-8 h-8 text-primary-DEFAULT mb-4" />
                <h3 className="font-semibold text-xl mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-gray-900 animate-fade-in-down">
              About UniConnect
            </h2>
            <p
              className="text-xl text-gray-600 leading-relaxed animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              Founded with a passion for education, UniConnect has been serving
              students since 2020. Our carefully curated platform brings
              together academic resources, social connectivity, and professional
              development tools, ensuring there's something for every student.
            </p>
            <Button
              className="bg-primary-DEFAULT hover:bg-primary-dark text-white transition-colors animate-fade-in-up"
              style={{ animationDelay: "0.4s" }}
            >
              Learn More About Us
            </Button>
          </div>

          <div
            className="relative group animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-DEFAULT/10 to-transparent rounded-xl transform group-hover:scale-105 transition-transform duration-300" />
            <img
              src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570"
              alt="Library interior"
              className="rounded-xl shadow-lg object-cover w-full h-[500px]"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 rounded-b-xl">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/10 backdrop-blur-sm rounded-full">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Digital Library</h3>
                  <p className="text-white/80 text-sm">
                    Access thousands of resources
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Programs */}
      <section className="py-20 px-6">
        <h2 className="text-3xl font-bold text-center mb-12">
          Academic Programs
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {[
            {
              icon: Trophy,
              title: "Business Administration",
              level: "Undergraduate",
            },
            { icon: Building2, title: "Computer Science", level: "Graduate" },
            {
              icon: Globe2,
              title: "International Relations",
              level: "Undergraduate",
            },
          ].map((program, i) => (
            <Card
              key={i}
              className="bg-background-secondary hover:shadow-xl transition-shadow duration-300"
            >
              <CardContent className="p-6">
                <program.icon className="w-8 h-8 text-primary-DEFAULT mb-4" />
                <h3 className="font-semibold text-xl mb-2">{program.title}</h3>
                <p className="text-gray-600">{program.level}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Campus Life */}
      <section className="py-20 px-6 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-12">Campus Life</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {[
            "https://picsum.photos/800/600?random=1",
            "https://picsum.photos/800/600?random=2",
            "https://picsum.photos/800/600?random=3",
            "https://picsum.photos/800/600?random=4",
            "https://picsum.photos/800/600?random=5",
            "https://picsum.photos/800/600?random=6",
          ].map((imgUrl, i) => (
            <div
              key={i}
              className="aspect-video relative overflow-hidden rounded-lg"
            >
              <img
                src={imgUrl}
                alt={`Campus life ${i + 1}`}
                className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Latest Updates */}
      <section className="py-24 px-6 bg-gradient-to-br from-background-secondary via-background-primary to-background-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div className="max-w-xl">
              <span className="text-primary-DEFAULT font-semibold mb-2 block">
                STAY UPDATED
              </span>
              <h2 className="text-4xl font-bold mb-4 animate-slide-in bg-clip-text text-transparent bg-gradient-to-r from-primary-DEFAULT to-primary-dark">
                Latest Updates
              </h2>
              <p
                className="text-xl text-gray-600 animate-fade-in-up"
                style={{ animationDelay: "0.2s" }}
              >
                Stay informed with campus news and events that matter to you
              </p>
            </div>
            <Button
              variant="outline"
              className="group border-primary-DEFAULT text-primary-DEFAULT hover:bg-primary-DEFAULT hover:text-white transition-all duration-300"
            >
              View All Updates
              <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "New Library Hours",
                date: "March 15, 2024",
                icon: <BookOpen className="w-6 h-6" />,
                category: "Facility Update",
                description:
                  "Extended hours during exam period to support your study needs",
              },
              {
                title: "Spring Break Schedule",
                date: "March 10, 2024",
                icon: <Calendar className="w-6 h-6" />,
                category: "Academic Calendar",
                description:
                  "Plan ahead with our comprehensive spring break activity schedule",
              },
              {
                title: "Campus Event: Tech Talk",
                date: "March 8, 2024",
                icon: <MessageSquare className="w-6 h-6" />,
                category: "Events",
                description:
                  "Join industry experts for an inspiring discussion on AI",
              },
            ].map((update, i) => (
              <div
                key={i}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 animate-fade-in-up overflow-hidden"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-primary-light/10 rounded-xl group-hover:bg-primary-light/20 transition-colors">
                      {update.icon}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-primary-DEFAULT">
                        {update.category}
                      </span>
                      <h3 className="font-semibold text-xl group-hover:text-primary-DEFAULT transition-colors">
                        {update.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {update.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{update.date}</span>
                    <Button
                      variant="ghost"
                      className="text-primary-DEFAULT hover:text-primary-dark p-0 h-auto font-medium"
                    >
                      Read More
                    </Button>
                  </div>
                </div>
                <div className="h-1 w-full bg-gradient-to-r from-primary-light via-primary-DEFAULT to-primary-dark transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center relative">
          <Button
            variant="outline"
            className="absolute left-0 top-1/2 -translate-y-1/2"
            onClick={() => {
              const testimonials = document.querySelector(
                ".testimonial-slider"
              );
              testimonials.scrollLeft -= testimonials.offsetWidth;
            }}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="outline"
            className="absolute right-0 top-1/2 -translate-y-1/2"
            onClick={() => {
              const testimonials = document.querySelector(
                ".testimonial-slider"
              );
              testimonials.scrollLeft += testimonials.offsetWidth;
            }}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
          <div className="testimonial-slider overflow-hidden">
            <div
              className="flex transition-transform duration-300"
              ref={(el) => {
                if (el) {
                  // Auto slide every 5 seconds
                  const interval = setInterval(() => {
                    el.style.transform = `translateX(-${el.offsetWidth}px)`;
                    // Reset transform after transition and move first slide to end
                    setTimeout(() => {
                      el.style.transition = "none";
                      el.style.transform = "translateX(0)";
                      el.appendChild(el.firstElementChild);
                      setTimeout(() => {
                        el.style.transition = "transform 300ms";
                      }, 50);
                    }, 300);
                  }, 5000);

                  // Cleanup interval on unmount
                  return () => clearInterval(interval);
                }
              }}
            >
              {[
                {
                  img: "https://picsum.photos/200/200?random=7",
                  quote:
                    "The community features are fantastic for collaboration.",
                  name: "Emma Davis",
                  role: "Biology Student",
                },
                {
                  img: "https://picsum.photos/200/200?random=8",
                  quote: "UniConnect has transformed my learning experience.",
                  name: "James Wilson",
                  role: "Computer Science Student",
                },
                {
                  img: "https://picsum.photos/200/200?random=9",
                  quote: "The global network opened up amazing opportunities.",
                  name: "Sarah Chen",
                  role: "Business Student",
                },
              ].map((testimonial, i) => (
                <div key={i} className="flex-none w-full">
                  <div className="mb-8">
                    <img
                      src={testimonial.img}
                      alt={testimonial.name}
                      className="rounded-full mx-auto w-24 h-24 object-cover"
                    />
                  </div>
                  <blockquote
                    className="text-xl italic mb-6 animate-fade-in-up"
                    style={{ animationDelay: "0.2s" }}
                  >
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-gray-600">{testimonial.role}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Dashboard Section */}
      <section className="py-24 px-6 bg-background-primary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-primary-DEFAULT font-semibold mb-2 block">
              ANALYTICS
            </span>
            <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-DEFAULT to-primary-dark">
              Platform Insights
            </h2>
            <p className="text-xl text-gray-600">
              Track engagement and growth across our platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Activity Overview */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-6">
                Monthly Activity Overview
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData.monthlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="students"
                    stackId="1"
                    stroke="#2563EB"
                    fill="#3B82F6"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="courses"
                    stackId="1"
                    stroke="#059669"
                    fill="#10B981"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="events"
                    stackId="1"
                    stroke="#DC2626"
                    fill="#EF4444"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Course Distribution */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-6">
                Course Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.courseDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analyticsData.courseDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"][
                            index % 4
                          ]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Student Progress */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-6">
                Student Progress Tracking
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.studentProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="completion"
                    stroke="#2563EB"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Stats */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-6">
                Platform Statistics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Active Users", value: "15,234", change: "+12%" },
                  { label: "Course Completion", value: "89%", change: "+5%" },
                  { label: "Study Groups", value: "1,234", change: "+8%" },
                  {
                    label: "Resources Shared",
                    value: "45,678",
                    change: "+15%",
                  },
                ].map((stat, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <div className="flex items-end gap-2">
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                      <span className="text-sm text-green-600 font-medium">
                        {stat.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-background-primary to-background-secondary">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-primary-DEFAULT font-semibold mb-2 block">
              GOT QUESTIONS?
            </span>
            <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-DEFAULT to-primary-dark">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Find answers to common questions about UniConnect
            </p>
          </div>

          <div className="grid gap-6">
            {[
              {
                question: "How do I join study groups?",
                answer:
                  "You can join study groups through the 'Groups' section in your dashboard. Browse available groups or create your own based on your courses and interests.",
              },
              {
                question:
                  "What resources are available in the digital library?",
                answer:
                  "Our digital library includes textbooks, research papers, video lectures, practice tests, and course materials. All resources are categorized by subject and course level.",
              },
              {
                question: "How can I connect with professors?",
                answer:
                  "Professors have dedicated profile pages where you can schedule virtual office hours, participate in discussion forums, and send direct messages for academic queries.",
              },
              {
                question: "Is there a mobile app available?",
                answer:
                  "Yes! Our mobile app is available for both iOS and Android devices. Download it from your respective app store to access UniConnect on the go.",
              },
              {
                question: "How does the achievement system work?",
                answer:
                  "Complete tasks, participate in discussions, and maintain good academic progress to earn badges and rewards. Track your achievements in your student profile.",
              },
            ].map((faq, i) => (
              <div
                key={i}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                onClick={(e) => {
                  const content = e.currentTarget.querySelector(".faq-content");
                  const icon = e.currentTarget.querySelector(".faq-icon");
                  content.classList.toggle("hidden");
                  icon.classList.toggle("rotate-45");
                }}
              >
                <div className="p-6 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-xl group-hover:text-primary-DEFAULT transition-colors">
                      {faq.question}
                    </h3>
                    <div className="faq-icon p-2 bg-primary-light/10 rounded-full transition-transform duration-300">
                      <svg
                        className="w-6 h-6 text-primary-DEFAULT"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="faq-content hidden mt-4 text-gray-600 animate-fade-in-down">
                    <p>{faq.answer}</p>
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-primary-DEFAULT border-primary-DEFAULT hover:bg-primary-DEFAULT hover:text-white"
                      >
                        Learn More
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600"
                      >
                        Contact Support
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="h-1 w-full bg-gradient-to-r from-primary-light via-primary-DEFAULT to-primary-dark transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-6">
              Still have questions? We're here to help!
            </p>
            <Button className="bg-primary-DEFAULT hover:bg-primary-dark text-white transition-colors">
              Contact Support
              <MessageSquare className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-dark text-background-primary py-12">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12">
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-2">
              <p>Email: contact@uniconnect.edu</p>
              <p>Phone: (555) 123-4567</p>
              <p>Address: 123 University Ave</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <a href="/privacy" className="block hover:text-gray-300">
                Privacy Policy
              </a>
              <a href="/terms" className="block hover:text-gray-300">
                Terms of Service
              </a>
              <a href="/faq" className="block hover:text-gray-300">
                FAQ
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <Facebook className="w-6 h-6" />
              <Twitter className="w-6 h-6" />
              <Instagram className="w-6 h-6" />
              <Linkedin className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="text-center mt-12 text-gray-400">
          © 2023 UniConnect. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
