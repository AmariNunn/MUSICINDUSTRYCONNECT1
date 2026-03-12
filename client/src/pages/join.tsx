
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertUserSchema } from "@shared/schema";
import { Link } from "wouter";
import { CheckCircle, UserPlus, Search, MessageCircle, Loader2, Lightbulb, Music, Stars, Sparkles, MapPin } from "lucide-react";
import { LocationPicker } from "@/components/location-picker";
import { z } from "zod";
import { getGenreBadge, getProfessionBadge } from "@/lib/badges";

const registrationSchema = insertUserSchema.extend({
  terms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

const tips = [
  "Tip: Bold bio = more connects! 🎤",
  "Tip: Message 3 people daily! 🤝",
  "Tip: Share a demo clip! 🎵",
  "Tip: Update your profile weekly! 📝",
  "Tip: Join genre-specific groups! 🎸",
  "Tip: Showcase your latest work! 🎬"
];

export default function JoinPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);
  const { toast } = useToast();

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      pkaName: "",
      email: "",
      phone: "",
      password: "",
      profession: [],
      genre: [],
      location: "",
      bio: "",
      website: "",
      socialInstagram: "",
      socialTwitter: "",
      musicSpotify: "",
      musicSoundcloud: "",
      terms: false,
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationFormData) => {
      const { terms, ...userData } = data;
      return apiRequest("POST", "/api/users", userData);
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast({
        title: "Welcome to Music Industry Connect!",
        description: "Your account has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegistrationFormData) => {
    registerMutation.mutate(data);
  };

  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % tips.length);
  };

  const professions = [
    { value: "Artist", label: "Artist - Singer, Rapper, Performer" },
    { value: "Administration", label: "Administration - Registrations, Royalties, Licensing, Copyrights" },
    { value: "Audio", label: "Audio - Engineering, Mixing, Recording, Live Sound, Mastering" },
    { value: "Consultant", label: "Consultant - Coaching, Development, Promotions, Marketing, Strategy" },
    { value: "Dancer", label: "Dancer - Dancers, Choreographers" },
    { value: "DJ", label: "DJ - Clubs, Parties, Radio" },
    { value: "Educator", label: "Educator - Teachers, Professors, Educators" },
    { value: "Fashion", label: "Fashion - Designers, Stylists" },
    { value: "Glam", label: "Glam - Hair Stylists, Makeup Artists" },
    { value: "Legal", label: "Legal - Lawyers, Attorneys, Legal Affairs, Negotiations" },
    { value: "Management", label: "Management - Artist, Business, Financial, Touring" },
    { value: "Marketing", label: "Marketing - Digital Marketing, Social Media, PR, Branding" },
    { value: "Music Executive", label: "Music Executive - A&R, Label Reps, GMs, Presidents, VPs" },
    { value: "Musician", label: "Musician - Sessions, Background, Touring" },
    { value: "Photographer/Videographer", label: "Photographer/Videographer - Photos, Videos, Editing" },
    { value: "Producer", label: "Producer - Beat Maker, Executive Producer" },
    { value: "Publishing", label: "Publishing - Music Publishing" },
    { value: "Radio/Podcast", label: "Radio/Podcast - Host, Producers, Personalities" },
    { value: "Record Label", label: "Record Label - Runs or Works at a Label" },
    { value: "Recording Studio", label: "Recording Studio - Owns or Works at Recording Space" },
    { value: "Songwriter", label: "Songwriter - Writes and Composes Music/Lyrics" },
    { value: "Synch", label: "Synch - Music Supervisors, Synch Reps, Licensors" },
    { value: "Touring", label: "Touring - Agents, Roadies, Stage Managers, Crew" },
    { value: "Venue", label: "Venue - Bars, Clubs, Creative Spaces" },
  ];

  const genres = [
    { value: "Pop", label: "Pop" },
    { value: "Hip-Hop", label: "Hip-Hop / Rap" },
    { value: "R&B", label: "R&B / Soul" },
    { value: "Rock", label: "Rock" },
    { value: "Country", label: "Country / Folk / Americana" },
    { value: "Electronic", label: "Electronic / EDM / Techno" },
    { value: "Dance", label: "Dance / House" },
    { value: "Reggae", label: "Reggae / Dancehall" },
    { value: "Latin", label: "Latin (Reggaetón, Bachata, Salsa)" },
    { value: "Afrobeats", label: "Afrobeats / Afro-Fusion" },
    { value: "Classical", label: "Classical / Opera" },
    { value: "Jazz", label: "Jazz" },
    { value: "Blues", label: "Blues" },
    { value: "Gospel", label: "Gospel / Christian / Inspirational" },
  ];

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#c084fc]/10 via-white to-[#c084fc]/20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white shadow-2xl">
            <CardContent className="p-10">
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-yellow-800" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-green-800 mb-3">Welcome to Music Industry Connect!</h1>
                <p className="text-green-700 mb-8 text-lg">Your account has been created successfully. You can now start connecting with music professionals.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/directory">
                    <Button className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                      <Search className="w-5 h-5 mr-2" />
                      Explore Directory
                    </Button>
                  </Link>
                  <Link href="/core">
                    <Button variant="outline" className="border-[#c084fc]/30 text-[#c084fc] hover:bg-[#c084fc]/10 px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Join Community
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Simplified Hero Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-[#c084fc] rounded-full flex items-center justify-center shadow-lg">
              <Music className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-[#c084fc]">
            Join Music Industry Connect
          </h1>
          <p className="text-lg text-gray-600">
            Connect with music professionals worldwide and grow your career
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="bg-[#c084fc] text-white rounded-t-lg py-4">
            <CardTitle className="text-center text-xl font-bold flex items-center justify-center gap-2">
              <UserPlus className="w-5 h-5" />
              Create Your Account
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Personal Information */}
                <div className="bg-[#c084fc]/5 rounded-xl p-6">
                  <h3 className="text-base font-bold mb-4 text-[#c084fc] flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#c084fc] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-semibold">First Name *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your first name" 
                              {...field} 
                              className="bg-[#c084fc]/5 border-[#c084fc]/20 focus:border-[#c084fc] rounded-md"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-semibold">Last Name *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your last name" 
                              {...field} 
                              className="bg-[#c084fc]/5 border-[#c084fc]/20 focus:border-[#c084fc] rounded-md"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-semibold">Email Address *</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="Enter your email" 
                              {...field} 
                              className="bg-[#c084fc]/5 border-[#c084fc]/20 focus:border-[#c084fc] rounded-md"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-semibold">Password *</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Create a password" 
                              {...field} 
                              className="bg-[#c084fc]/5 border-[#c084fc]/20 focus:border-[#c084fc] rounded-md"
                            />
                          </FormControl>
                          <FormDescription className="text-[#c084fc]">Minimum 8 characters</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Professional Information */}
                <div className="bg-[#c084fc]/5 rounded-xl p-6">
                  <h3 className="text-base font-bold mb-4 text-[#c084fc] flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#c084fc] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                    Professional Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="profession"
                      render={({ field }) => {
                        const selectedValue = Array.isArray(field.value) ? field.value[0] : field.value;
                        const selectedBadge = selectedValue ? getProfessionBadge(selectedValue) : null;
                        
                        return (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-semibold">Primary Profession *</FormLabel>
                            <Select 
                              onValueChange={(value) => field.onChange([value])} 
                              value={selectedValue}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-[#c084fc]/5 border-[#c084fc]/20 focus:border-[#c084fc] text-black">
                                  <div className="flex items-center gap-2">
                                    {selectedBadge && (
                                      <img 
                                        src={selectedBadge} 
                                        alt="profession badge"
                                        className="w-5 h-5 object-contain"
                                      />
                                    )}
                                    <SelectValue placeholder="Select your profession" />
                                  </div>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {professions.map((profession) => (
                                  <SelectItem key={profession.value} value={profession.value}>
                                    {profession.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={form.control}
                      name="genre"
                      render={({ field }) => {
                        const selectedValue = Array.isArray(field.value) ? field.value[0] : field.value;
                        const selectedBadge = selectedValue ? getGenreBadge(selectedValue) : null;
                        
                        return (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-semibold">Primary Genre *</FormLabel>
                            <Select 
                              onValueChange={(value) => field.onChange([value])} 
                              value={selectedValue}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-[#c084fc]/5 border-[#c084fc]/20 focus:border-[#c084fc] text-black">
                                  <div className="flex items-center gap-2">
                                    {selectedBadge && (
                                      <img 
                                        src={selectedBadge} 
                                        alt="genre badge"
                                        className="w-5 h-5 object-contain"
                                      />
                                    )}
                                    <SelectValue placeholder="Select your genre" />
                                  </div>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {genres.map((genre) => (
                                  <SelectItem key={genre.value} value={genre.value}>
                                    {genre.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem className="mt-6">
                        <FormLabel className="text-gray-700 font-semibold">Location</FormLabel>
                        <FormControl>
                          <LocationPicker
                            value={field.value || ""}
                            onChange={field.onChange}
                            placeholder="Search for your city..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem className="mt-6">
                        <FormLabel className="text-gray-700 font-semibold">Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about yourself, your experience, and what you're looking for..."
                            className="min-h-[120px] border-purple-200 focus:border-purple-400 focus:ring-purple-200 bg-white/70 backdrop-blur-sm rounded-xl text-gray-900"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription className="text-[#c084fc] font-medium">
                          Pro tip: A detailed bio gets 3x more connections!
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Terms and Submit */}
                <div className="bg-[#c084fc]/5 rounded-xl p-6">
                  <h3 className="text-base font-bold mb-4 text-[#c084fc] flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#c084fc] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">3</span>
                    </div>
                    Agreement
                  </h3>
                  <FormField
                    control={form.control}
                    name="terms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                            className="border-purple-300 data-[state=checked]:bg-[#c084fc]"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-gray-700">
                            I agree to the <span className="text-[#c084fc] underline cursor-pointer font-semibold">Terms of Service</span> and <span className="text-[#c084fc] underline cursor-pointer font-semibold">Privacy Policy</span>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full mt-6 bg-[#c084fc] hover:bg-[#c084fc]/90 text-white py-3 rounded-md font-medium"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Account
                  </Button>
                </div>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Already have an account? <Link href="/login" className="text-[#c084fc] hover:text-[#c084fc]/80 cursor-pointer font-medium hover:underline">Sign in here</Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Simplified Tip Card */}
        <Card className="mt-6 cursor-pointer hover:shadow-lg transition-all duration-200 bg-[#c084fc]/5 border-[#c084fc]/20" onClick={nextTip}>
          <CardContent className="p-4">
            <h3 className="text-sm font-bold mb-2 text-[#c084fc] flex items-center gap-2">
              <div className="w-5 h-5 bg-[#c084fc] rounded-full flex items-center justify-center">
                <Lightbulb className="w-3 h-3 text-white" />
              </div>
              Tips
            </h3>
            <p className="text-gray-700 text-sm">{tips[currentTip]}</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
