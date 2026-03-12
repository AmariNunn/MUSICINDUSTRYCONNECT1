import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import micLogo from "@assets/MIC Logo 2_1752952044953.png";
import testimonial1 from "@assets/1_1761671469189.png";
import testimonial2 from "@assets/2_1761671469190.png";
import testimonial3 from "@assets/3_1761671469191.png";
import communityLogo from "@assets/Community (2) (1)_1761672226325.png";
import opportunityLogo from "@assets/Opportunity (1)_1761672226326.png";
import eventsLogo from "@assets/Events (1)_1761672237774.png";
import resourcesLogo from "@assets/Resources (1)_1761672237775.png";
import { 
  Users, 
  Music, 
  Handshake, 
  Briefcase, 
  Star, 
  ArrowRight, 
  CheckCircle, 
  Mic,
  LogIn,
  UserPlus,
  TrendingUp,
  Globe
} from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      image: communityLogo,
      title: "Community",
      description: "Connect with artists, producers, engineers, and industry professionals in a vibrant music community."
    },
    {
      image: opportunityLogo,
      title: "Opportunities",
      description: "Discover gigs, collaborations, and career opportunities tailored to your music journey."
    },
    {
      image: eventsLogo,
      title: "Events",
      description: "Join exclusive music industry events, workshops, and networking sessions to grow your career."
    },
    {
      image: resourcesLogo,
      title: "Resources",
      description: "Access valuable tools, guides, and educational content to elevate your music skills."
    }
  ];

  const stats = [
    { label: "Active Members", value: "12,543" },
    { label: "Connections Made", value: "8,291" },
    { label: "Opportunities Posted", value: "2,156" },
    { label: "Cities Worldwide", value: "150+" }
  ];

  const testimonials = [
    {
      image: testimonial1,
      alt: "Testimonial from Maddie Tom, Singer/Songwriter"
    },
    {
      image: testimonial2,
      alt: "Testimonial from Emma Green, Artist"
    },
    {
      image: testimonial3,
      alt: "Testimonial from Carlie Allen, Singer/Songwriter"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-[#c084fc] shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img 
                src={micLogo} 
                alt="MIC Logo" 
                className="h-12 w-auto"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button className="bg-white text-[#c084fc] hover:bg-gray-100 font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg">
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
              <Link href="/join">
                <Button className="bg-white text-[#c084fc] hover:bg-gray-100 font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign Up Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      {/* Hero Section */}
      <section className="bg-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-[#c084fc]">Connect.</span> Create. <span className="text-white">Collaborate.</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-3xl mx-auto">
            Join the world's largest network of music industry professionals. 
            Find opportunities, build connections, and grow your career.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/join">
              <Button size="lg" className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white font-medium text-lg px-8 py-4">
                <UserPlus className="w-5 h-5 mr-2" />
                Get Started Free
              </Button>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#c084fc]">{stat.value}</div>
                <div className="text-sm md:text-base text-[#c084fc]/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg sm:text-xl text-[#c084fc]/80 max-w-2xl mx-auto">
              Our platform provides all the tools and connections you need to thrive in the music industry.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover-lift text-center bg-white border-[#c084fc]/30">
                <CardContent className="p-4 sm:p-6 bg-white">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-3 sm:mb-4">
                    <img 
                      src={feature.image} 
                      alt={feature.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold mb-2 text-gray-900">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* Testimonials Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trusted by Music Professionals
            </h2>
            <p className="text-xl text-[#c084fc]/80">
              See what our community members have to say about their experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="transition-transform duration-300 hover:scale-105">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.alt}
                  className="w-full h-auto rounded-lg shadow-xl"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#c084fc] to-[#c084fc]/80 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Take Your Music Career to the Next Level?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of music professionals who are already growing their careers with Music Industry Connect.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/join">
              <Button size="lg" className="bg-white text-[#c084fc] hover:bg-gray-100 font-medium text-lg px-8 py-4">
                <UserPlus className="w-5 h-5 mr-2" />
                Start Connecting Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center space-x-6 text-sm opacity-90">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Free to join
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              No hidden fees
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Instant access
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-black text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src={micLogo} 
                  alt="MIC Logo" 
                  className="h-10 w-auto"
                />
                <h3 className="text-lg font-bold text-white">MIC</h3>
              </div>
              <p className="text-gray-400">
                Connecting music professionals worldwide to create, collaborate, and grow together.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/directory" className="hover:text-white">Directory</Link></li>
                <li><Link href="/core" className="hover:text-white">Community</Link></li>
                <li><Link href="/join" className="hover:text-white">Join</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Community Guidelines</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Music Industry Connect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}