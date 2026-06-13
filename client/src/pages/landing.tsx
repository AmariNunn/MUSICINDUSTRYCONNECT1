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
  Globe,
  Crown,
  Check,
  X,
  Zap
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
      image: resourcesLogo,
      title: "Resources",
      description: "Access valuable tools, guides, and educational content to elevate your music skills."
    },
    {
      image: eventsLogo,
      title: "Events",
      description: "Join exclusive music industry events, workshops, and networking sessions to grow your career."
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

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      badge: null,
      description: "Everything you need to get started in the music industry.",
      accentColor: "border-gray-700",
      badgeBg: null,
      buttonClass: "bg-white text-black hover:bg-gray-100 border border-gray-300",
      features: [
        { text: "Profile listing in directory", included: true },
        { text: "Browse opportunities & events", included: true },
        { text: "Up to 10 connections", included: true },
        { text: "Basic profile customization", included: true },
        { text: "Community (Core) posting", included: false },
        { text: "Unlimited connections", included: false },
        { text: "Priority directory placement", included: false },
        { text: "Exclusive opportunities", included: false },
      ],
    },
    {
      name: "Gold",
      price: "$9",
      period: "per month",
      badge: "Most Popular",
      description: "Unlock the full power of networking and community.",
      accentColor: "border-yellow-400",
      badgeBg: "bg-yellow-400 text-black",
      buttonClass: "bg-yellow-400 hover:bg-yellow-300 text-black font-bold",
      features: [
        { text: "Everything in Free", included: true },
        { text: "Unlimited connections", included: true },
        { text: "Community (Core) posting", included: true },
        { text: "Standard directory placement", included: true },
        { text: "Advanced profile customization", included: true },
        { text: "Priority directory placement", included: false },
        { text: "Verified badge eligibility", included: false },
        { text: "Exclusive platinum opportunities", included: false },
      ],
    },
    {
      name: "Platinum",
      price: "$19",
      period: "per month",
      badge: "Best Value",
      description: "The ultimate membership for serious industry professionals.",
      accentColor: "border-[#c084fc]",
      badgeBg: "bg-[#c084fc] text-white",
      buttonClass: "bg-[#c084fc] hover:bg-[#a855f7] text-white font-bold",
      features: [
        { text: "Everything in Gold", included: true },
        { text: "Priority directory placement", included: true },
        { text: "Verified badge eligibility", included: true },
        { text: "Exclusive platinum opportunities", included: true },
        { text: "Featured profile highlight", included: true },
        { text: "Early access to new features", included: true },
        { text: "Dedicated support", included: true },
        { text: "Analytics & profile insights", included: true },
      ],
    },
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
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <a href="#pricing">
                <Button className="bg-white text-[#c084fc] hover:bg-gray-100 font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg hidden sm:flex">
                  Pricing
                </Button>
              </a>
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
      <section className="bg-black text-white pt-20 pb-4">
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
            <a href="#pricing">
              <Button size="lg" variant="outline" className="border-[#c084fc] text-[#c084fc] hover:bg-[#c084fc]/10 font-medium text-lg px-8 py-4">
                <Crown className="w-5 h-5 mr-2" />
                View Plans
              </Button>
            </a>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 sm:py-10 lg:py-12 bg-black">
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

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-zinc-950 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-[#c084fc]/10 border border-[#c084fc]/30 rounded-full px-4 py-1.5 text-[#c084fc] text-sm font-medium mb-4">
              <Crown className="w-4 h-4" />
              Membership Plans
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Choose Your Membership
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Start free and upgrade anytime. Every plan gives you access to the MIC community of music professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {plans.map((plan, index) => {
              const isPlatinum = plan.name === "Platinum";
              return (
                <div
                  key={index}
                  className={`relative flex flex-col rounded-2xl border-2 ${plan.accentColor} ${
                    isPlatinum
                      ? "bg-gradient-to-b from-[#c084fc]/10 to-zinc-900 shadow-2xl shadow-[#c084fc]/20 scale-[1.02]"
                      : "bg-zinc-900"
                  } p-8 transition-transform duration-300 hover:-translate-y-1`}
                  data-testid={`card-plan-${plan.name.toLowerCase()}`}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${plan.badgeBg}`}>
                        <Zap className="w-3 h-3" />
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  {/* Plan name + icon */}
                  <div className="flex items-center gap-2 mb-2">
                    {isPlatinum && <Crown className="w-5 h-5 text-[#c084fc]" />}
                    {plan.name === "Gold" && <Star className="w-5 h-5 text-yellow-400" />}
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  </div>

                  {/* Price */}
                  <div className="mb-3">
                    <span className="text-5xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-gray-400 ml-2 text-sm">/{plan.period}</span>
                  </div>

                  <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

                  {/* CTA */}
                  <Link href="/join" className="mb-8">
                    <Button className={`w-full py-3 rounded-xl text-base ${plan.buttonClass}`} data-testid={`button-plan-${plan.name.toLowerCase()}`}>
                      {plan.name === "Free" ? "Get Started Free" : `Start ${plan.name}`}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>

                  {/* Divider */}
                  <div className="border-t border-zinc-700 mb-6" />

                  {/* Features */}
                  <ul className="space-y-3 flex-1">
                    {plan.features.map((feature, fi) => (
                      <li key={fi} className="flex items-start gap-3">
                        {feature.included ? (
                          <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                            isPlatinum ? "bg-[#c084fc]/20" : plan.name === "Gold" ? "bg-yellow-400/20" : "bg-gray-700"
                          }`}>
                            <Check className={`w-3 h-3 ${
                              isPlatinum ? "text-[#c084fc]" : plan.name === "Gold" ? "text-yellow-400" : "text-gray-300"
                            }`} />
                          </div>
                        ) : (
                          <div className="mt-0.5 w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                            <X className="w-3 h-3 text-zinc-600" />
                          </div>
                        )}
                        <span className={`text-sm ${feature.included ? "text-gray-200" : "text-zinc-600"}`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <p className="text-center text-gray-500 text-sm mt-10">
            All plans include a 7-day free trial. Cancel anytime. No contracts.
          </p>
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
