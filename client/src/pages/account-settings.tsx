import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  User, 
  Shield, 
  CreditCard, 
  Bell, 
  Lock, 
  Settings, 
  Database, 
  FileText,
  Mail,
  Phone,
  Calendar,
  Key,
  Smartphone,
  Monitor,
  LogOut,
  Crown,
  Download,
  Trash2,
  HelpCircle,
  MessageSquare,
  Globe,
  Clock,
  Play,
  Filter,
  HardDrive,
  Image,
  Users,
  Eye,
  EyeOff,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User as UserType } from "@shared/schema";

export default function AccountSettings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("personal");
  const [expandedLegalSections, setExpandedLegalSections] = useState<{[key: string]: boolean}>({
    userAgreement: false,
    privacyPolicy: false,
    communityPolicy: false
  });
  
  // Fetch users and get logged-in user
  const { data: users = [] } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
  });
  
  const loggedInUserId = localStorage.getItem('currentUserId');
  const currentUser = users.find(user => user.id.toString() === loggedInUserId);
  
  const toggleLegalSection = (section: string) => {
    setExpandedLegalSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    dateOfBirth: "",
    contactEmail: "",
    phoneNumber: "",
    address: ""
  });
  
  // Update personal info when user data loads
  useEffect(() => {
    if (currentUser) {
      setPersonalInfo({
        fullName: currentUser.name || "",
        dateOfBirth: "",
        contactEmail: currentUser.email || "",
        phoneNumber: "",
        address: currentUser.location || ""
      });
    }
  }, [currentUser]);

  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    googleConnected: true,
    appleConnected: false,
    facebookConnected: false
  });

  const [notifications, setNotifications] = useState({
    pushEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    messages: true,
    jobAlerts: true,
    eventReminders: true,
    webinarAnnouncements: true,
    socialEngagement: true,
    newFollowers: true,
    communityPosts: false,
    systemUpdates: true
  });

  const [privacy, setPrivacy] = useState({
    whoCanMessage: "everyone",
    whoCanViewProfile: "everyone",
    hideOnlineStatus: false,
    allowSearch: true
  });

  const [preferences, setPreferences] = useState({
    language: "en",
    timezone: "America/Los_Angeles",
    autoplayVideos: true,
    contentFilters: []
  });

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your account settings have been updated successfully."
    });
  };

  const handleChangePassword = () => {
    toast({
      title: "Password Reset Email Sent",
      description: "Check your email for instructions to reset your password."
    });
  };

  const handleLogoutAllDevices = () => {
    toast({
      title: "Logged Out",
      description: "You have been logged out of all devices."
    });
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/home")}
            className="text-[#c084fc] hover:bg-purple-50"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-black">Account Settings</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex flex-wrap gap-1 bg-zinc-100 p-1.5 rounded-lg border border-zinc-200 h-auto">
            <TabsTrigger value="personal" className="text-zinc-600 data-[state=active]:bg-white data-[state=active]:text-[#c084fc] data-[state=active]:shadow-sm flex items-center gap-2 px-3 py-2 rounded-md transition-all" data-testid="tab-personal">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Personal</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="text-zinc-600 data-[state=active]:bg-white data-[state=active]:text-[#c084fc] data-[state=active]:shadow-sm flex items-center gap-2 px-3 py-2 rounded-md transition-all" data-testid="tab-security">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="membership" className="text-zinc-600 data-[state=active]:bg-white data-[state=active]:text-[#c084fc] data-[state=active]:shadow-sm flex items-center gap-2 px-3 py-2 rounded-md transition-all" data-testid="tab-membership">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Membership</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-zinc-600 data-[state=active]:bg-white data-[state=active]:text-[#c084fc] data-[state=active]:shadow-sm flex items-center gap-2 px-3 py-2 rounded-md transition-all" data-testid="tab-notifications">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="legal" className="text-zinc-600 data-[state=active]:bg-white data-[state=active]:text-[#c084fc] data-[state=active]:shadow-sm flex items-center gap-2 px-3 py-2 rounded-md transition-all" data-testid="tab-legal">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Legal</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card className="bg-white border border-zinc-200 rounded-xl shadow-sm">
              <CardHeader className="border-b border-zinc-200 pb-4">
                <CardTitle className="flex items-center gap-2 text-black">
                  <User className="w-5 h-5 text-[#c084fc]" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="flex items-center gap-2 text-zinc-600">
                      <User className="w-4 h-4 text-zinc-500" />
                      Full Legal Name
                    </Label>
                    <Input
                      id="fullName"
                      value={personalInfo.fullName}
                      onChange={(e) => setPersonalInfo({...personalInfo, fullName: e.target.value})}
                      className="bg-zinc-50 border-zinc-200 text-black placeholder:text-zinc-400 focus:border-[#c084fc] focus:ring-[#c084fc]"
                      data-testid="input-full-name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dob" className="flex items-center gap-2 text-zinc-600">
                      <Calendar className="w-4 h-4 text-zinc-500" />
                      Date of Birth
                    </Label>
                    <Input
                      id="dob"
                      type="date"
                      value={personalInfo.dateOfBirth}
                      onChange={(e) => setPersonalInfo({...personalInfo, dateOfBirth: e.target.value})}
                      className="bg-zinc-50 border-zinc-200 text-black placeholder:text-zinc-400 focus:border-[#c084fc] focus:ring-[#c084fc]"
                      data-testid="input-dob"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2 text-zinc-600">
                      <Mail className="w-4 h-4 text-zinc-500" />
                      Contact Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={personalInfo.contactEmail}
                      onChange={(e) => setPersonalInfo({...personalInfo, contactEmail: e.target.value})}
                      className="bg-zinc-50 border-zinc-200 text-black placeholder:text-zinc-400 focus:border-[#c084fc] focus:ring-[#c084fc]"
                      data-testid="input-email"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2 text-zinc-600">
                      <Phone className="w-4 h-4 text-zinc-500" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={personalInfo.phoneNumber}
                      onChange={(e) => setPersonalInfo({...personalInfo, phoneNumber: e.target.value})}
                      className="bg-zinc-50 border-zinc-200 text-black placeholder:text-zinc-400 focus:border-[#c084fc] focus:ring-[#c084fc]"
                      data-testid="input-phone"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address" className="flex items-center gap-2 text-zinc-600">
                      <Globe className="w-4 h-4 text-zinc-500" />
                      Address (Optional - for billing)
                    </Label>
                    <Input
                      id="address"
                      value={personalInfo.address}
                      onChange={(e) => setPersonalInfo({...personalInfo, address: e.target.value})}
                      placeholder="Enter your billing address"
                      className="bg-zinc-50 border-zinc-200 text-black placeholder:text-zinc-400 focus:border-[#c084fc] focus:ring-[#c084fc]"
                      data-testid="input-address"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={handleSave}
                    className="bg-[#c084fc] hover:bg-[#a855f7] text-white font-semibold"
                    data-testid="button-save-personal"
                  >
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="bg-white border border-zinc-200 shadow-sm rounded-xl">
              <CardHeader className="border-b border-zinc-200 pb-4">
                <CardTitle className="flex items-center gap-2 text-black">
                  <Key className="w-5 h-5 text-[#c084fc]" />
                  Login & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-zinc-600" />
                      <div>
                        <p className="font-medium text-black">Email Address</p>
                        <p className="text-sm text-zinc-500">{personalInfo.contactEmail}</p>
                      </div>
                    </div>
                    <Button variant="outline" className="border-[#c084fc] text-[#c084fc] hover:bg-[#c084fc] hover:text-white" data-testid="button-change-email">
                      Change
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-zinc-600" />
                      <div>
                        <p className="font-medium text-black">Password</p>
                        <p className="text-sm text-zinc-500">Last changed 30 days ago</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="border-[#c084fc] text-[#c084fc] hover:bg-[#c084fc] hover:text-white"
                      onClick={handleChangePassword}
                      data-testid="button-change-password"
                    >
                      Change
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-zinc-600" />
                      <div>
                        <p className="font-medium text-black">Two-Factor Authentication</p>
                        <p className="text-sm text-zinc-500">Add an extra layer of security</p>
                      </div>
                    </div>
                    <Switch
                      checked={security.twoFactorEnabled}
                      onCheckedChange={(checked) => setSecurity({...security, twoFactorEnabled: checked})}
                      data-testid="switch-2fa"
                    />
                  </div>
                </div>
                
                <Separator className="bg-zinc-200" />
                
                <div>
                  <h3 className="font-semibold text-black mb-4">Connected Accounts</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-black text-xs font-bold">G</span>
                        </div>
                        <span className="font-medium text-black">Google</span>
                      </div>
                      <Button 
                        variant="outline"
                        size="sm"
                        className={security.googleConnected ? "border-red-400 text-red-400 hover:bg-red-400 hover:text-white" : "border-[#c084fc] text-[#c084fc] hover:bg-[#c084fc] hover:text-white"}
                        onClick={() => setSecurity({...security, googleConnected: !security.googleConnected})}
                        data-testid="button-google-connect"
                      >
                        {security.googleConnected ? "Disconnect" : "Connect"}
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                          <span className="text-black text-xs font-bold">A</span>
                        </div>
                        <span className="font-medium text-black">Apple</span>
                      </div>
                      <Button 
                        variant="outline"
                        size="sm"
                        className={security.appleConnected ? "border-red-400 text-red-400 hover:bg-red-400 hover:text-white" : "border-[#c084fc] text-[#c084fc] hover:bg-[#c084fc] hover:text-white"}
                        onClick={() => setSecurity({...security, appleConnected: !security.appleConnected})}
                        data-testid="button-apple-connect"
                      >
                        {security.appleConnected ? "Disconnect" : "Connect"}
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-black text-xs font-bold">f</span>
                        </div>
                        <span className="font-medium text-black">Facebook</span>
                      </div>
                      <Button 
                        variant="outline"
                        size="sm"
                        className={security.facebookConnected ? "border-red-400 text-red-400 hover:bg-red-400 hover:text-white" : "border-[#c084fc] text-[#c084fc] hover:bg-[#c084fc] hover:text-white"}
                        onClick={() => setSecurity({...security, facebookConnected: !security.facebookConnected})}
                        data-testid="button-facebook-connect"
                      >
                        {security.facebookConnected ? "Disconnect" : "Connect"}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Separator className="bg-zinc-200" />
                
                <div>
                  <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-zinc-600" />
                    Login History / Active Sessions
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <Monitor className="w-5 h-5 text-green-400" />
                        <div>
                          <p className="font-medium text-black">Current Session</p>
                          <p className="text-sm text-zinc-500">Chrome on MacOS · Los Angeles, CA</p>
                          <p className="text-xs text-zinc-400">Active now</p>
                        </div>
                      </div>
                      <span className="text-xs text-green-400 font-medium bg-green-500/20 px-2 py-1 rounded">This Device</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-zinc-400" />
                        <div>
                          <p className="font-medium text-black">iPhone 14 Pro</p>
                          <p className="text-sm text-zinc-500">Safari on iOS · Los Angeles, CA</p>
                          <p className="text-xs text-zinc-400">Last active 2 hours ago</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="border-[#c084fc] text-[#c084fc] hover:bg-[#c084fc] hover:text-white" data-testid="button-revoke-session-1">
                        Revoke
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                      <div className="flex items-center gap-3">
                        <Monitor className="w-5 h-5 text-zinc-400" />
                        <div>
                          <p className="font-medium text-black">Windows PC</p>
                          <p className="text-sm text-zinc-500">Chrome on Windows · New York, NY</p>
                          <p className="text-xs text-zinc-400">Last active 3 days ago</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="border-[#c084fc] text-[#c084fc] hover:bg-[#c084fc] hover:text-white" data-testid="button-revoke-session-2">
                        Revoke
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Separator className="bg-zinc-200" />
                
                <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                  <div className="flex items-center gap-3">
                    <LogOut className="w-5 h-5 text-red-400" />
                    <div>
                      <p className="font-medium text-black">Logout All Devices</p>
                      <p className="text-sm text-zinc-500">Sign out from all active sessions</p>
                    </div>
                  </div>
                  <Button 
                    className="bg-[#c084fc] hover:bg-[#a855f7] text-white"
                    onClick={handleLogoutAllDevices}
                    data-testid="button-logout-all"
                  >
                    Logout All
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="membership">
            <Card className="bg-white border border-zinc-200 shadow-sm rounded-xl">
              <CardHeader className="border-b border-zinc-200 pb-4">
                <CardTitle className="flex items-center gap-2 text-black">
                  <Crown className="w-5 h-5 text-[#c084fc]" />
                  Membership & Billing
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="p-6 bg-zinc-100 rounded-xl border border-zinc-300">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#c084fc] to-purple-600 rounded-full flex items-center justify-center">
                        <Crown className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-black">Gold Member</h3>
                        <p className="text-sm text-zinc-500">Free Plan</p>
                      </div>
                    </div>
                    <Button className="bg-[#c084fc] hover:bg-[#a855f7] text-white font-semibold" data-testid="button-upgrade">
                      Upgrade to Platinum
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-3 bg-zinc-100 rounded-lg">
                      <p className="text-2xl font-bold text-black">Free</p>
                      <p className="text-xs text-zinc-500">Current Plan</p>
                    </div>
                    <div className="p-3 bg-zinc-100 rounded-lg">
                      <p className="text-2xl font-bold text-black">N/A</p>
                      <p className="text-xs text-zinc-500">Renewal Date</p>
                    </div>
                    <div className="p-3 bg-zinc-100 rounded-lg">
                      <p className="text-2xl font-bold text-black">3</p>
                      <p className="text-xs text-zinc-500">Months Active</p>
                    </div>
                    <div className="p-3 bg-zinc-100 rounded-lg">
                      <p className="text-2xl font-bold text-green-400">Active</p>
                      <p className="text-xs text-zinc-500">Status</p>
                    </div>
                  </div>
                </div>
                
                <Separator className="bg-zinc-200" />
                
                <div>
                  <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-zinc-600" />
                    Payment Methods
                  </h3>
                  <div className="p-4 bg-zinc-50 rounded-lg text-center border border-zinc-200">
                    <CreditCard className="w-8 h-8 mx-auto mb-2 text-zinc-400" />
                    <p className="text-zinc-500">No payment methods on file</p>
                    <Button variant="outline" className="mt-3 border-[#c084fc] text-[#c084fc] hover:bg-[#c084fc] hover:text-white" data-testid="button-add-payment">
                      Add Payment Method
                    </Button>
                  </div>
                </div>
                
                <Separator className="bg-zinc-200" />
                
                <div>
                  <h3 className="font-semibold text-black mb-4">Billing History</h3>
                  <div className="p-4 bg-zinc-50 rounded-lg text-center border border-zinc-200">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-zinc-400" />
                    <p className="text-zinc-500">No billing history available</p>
                  </div>
                </div>
                
                <Separator className="bg-zinc-200" />
                
                <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/30">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-black">Cancel Membership</p>
                      <p className="text-sm text-zinc-500 mb-3">You are currently on the free Gold plan. If you upgrade to Platinum, you can cancel your subscription here at any time.</p>
                      <Button 
                        variant="outline" 
                        className="border-[#c084fc] text-[#c084fc] hover:bg-[#c084fc] hover:text-white"
                        data-testid="button-cancel-membership"
                      >
                        Cancel Membership
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="bg-white border border-zinc-200 shadow-sm rounded-xl">
              <CardHeader className="border-b border-zinc-200 pb-4">
                <CardTitle className="flex items-center gap-2 text-black">
                  <Bell className="w-5 h-5 text-[#c084fc]" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-black mb-4">Notification Channels</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-zinc-600" />
                        <span className="font-medium text-black">Push Notifications</span>
                      </div>
                      <Switch
                        checked={notifications.pushEnabled}
                        onCheckedChange={(checked) => setNotifications({...notifications, pushEnabled: checked})}
                        data-testid="switch-push"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-zinc-600" />
                        <span className="font-medium text-black">Email Notifications</span>
                      </div>
                      <Switch
                        checked={notifications.emailEnabled}
                        onCheckedChange={(checked) => setNotifications({...notifications, emailEnabled: checked})}
                        data-testid="switch-email"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-zinc-600" />
                        <span className="font-medium text-black">SMS Notifications</span>
                      </div>
                      <Switch
                        checked={notifications.smsEnabled}
                        onCheckedChange={(checked) => setNotifications({...notifications, smsEnabled: checked})}
                        data-testid="switch-sms"
                      />
                    </div>
                  </div>
                </div>
                
                <Separator className="bg-zinc-200" />
                
                <div>
                  <h3 className="font-semibold text-black mb-4">Alert Preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { key: "messages", label: "Messages", icon: MessageSquare },
                      { key: "jobAlerts", label: "Job Alerts", icon: FileText },
                      { key: "eventReminders", label: "Event Reminders", icon: Calendar },
                      { key: "webinarAnnouncements", label: "Webinar Announcements", icon: Monitor },
                      { key: "socialEngagement", label: "Social Engagement", icon: Users },
                      { key: "newFollowers", label: "New Followers", icon: User },
                      { key: "communityPosts", label: "Community Posts", icon: MessageSquare },
                      { key: "systemUpdates", label: "System Updates", icon: Settings }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                        <div className="flex items-center gap-2">
                          <item.icon className="w-4 h-4 text-zinc-600" />
                          <span className="text-sm font-medium text-black">{item.label}</span>
                        </div>
                        <Switch
                          checked={notifications[item.key as keyof typeof notifications] as boolean}
                          onCheckedChange={(checked) => setNotifications({...notifications, [item.key]: checked})}
                          data-testid={`switch-${item.key}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={handleSave}
                    className="bg-[#c084fc] hover:bg-[#a855f7] text-white"
                    data-testid="button-save-notifications"
                  >
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card className="bg-white border border-zinc-200 shadow-sm rounded-xl">
              <CardHeader className="border-b border-zinc-200 pb-4">
                <CardTitle className="flex items-center gap-2 text-black">
                  <Settings className="w-5 h-5 text-zinc-600" />
                  App Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-zinc-700">
                      <Globe className="w-4 h-4 text-zinc-600" />
                      Language
                    </Label>
                    <Select
                      value={preferences.language}
                      onValueChange={(value) => setPreferences({...preferences, language: value})}
                    >
                      <SelectTrigger data-testid="select-language" className="bg-zinc-50 border-zinc-200 text-black">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="pt">Português</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-zinc-700">
                      <Clock className="w-4 h-4 text-zinc-600" />
                      Time Zone
                    </Label>
                    <Select
                      value={preferences.timezone}
                      onValueChange={(value) => setPreferences({...preferences, timezone: value})}
                    >
                      <SelectTrigger data-testid="select-timezone" className="bg-zinc-50 border-zinc-200 text-black">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT)</SelectItem>
                        <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                  <div className="flex items-center gap-3">
                    <Play className="w-5 h-5 text-zinc-600" />
                    <div>
                      <p className="font-medium text-black">Autoplay Videos</p>
                      <p className="text-sm text-zinc-500">Automatically play videos in feed</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.autoplayVideos}
                    onCheckedChange={(checked) => setPreferences({...preferences, autoplayVideos: checked})}
                    data-testid="switch-autoplay"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-zinc-700">
                    <Filter className="w-4 h-4 text-zinc-600" />
                    Content Filters (Genre Preferences)
                  </Label>
                  <p className="text-sm text-zinc-500">Select genres you're interested in seeing more of</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["Pop", "Hip-Hop", "R&B", "Rock", "Country", "Electronic", "Dance", "Reggae", "Latin", "Afrobeats", "Classical", "Jazz", "Blues", "Gospel"].map((genre) => (
                      <Button
                        key={genre}
                        variant="outline"
                        size="sm"
                        className="rounded-full border-[#c084fc] text-[#c084fc] hover:bg-[#c084fc] hover:text-white"
                        data-testid={`button-genre-${genre.toLowerCase()}`}
                      >
                        {genre}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={handleSave}
                    className="bg-[#c084fc] hover:bg-[#a855f7] text-black"
                    data-testid="button-save-preferences"
                  >
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data">
            <Card className="bg-white border border-zinc-200 shadow-sm rounded-xl">
              <CardHeader className="border-b border-zinc-200 pb-4">
                <CardTitle className="flex items-center gap-2 text-black">
                  <Database className="w-5 h-5 text-zinc-600" />
                  Data & Storage
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-zinc-50 rounded-lg text-center border border-zinc-200">
                    <HardDrive className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
                    <p className="text-2xl font-bold text-black">2.5 MB</p>
                    <p className="text-sm text-zinc-500">Total Storage Used</p>
                  </div>
                  <div className="p-4 bg-zinc-50 rounded-lg text-center border border-zinc-200">
                    <Image className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
                    <p className="text-2xl font-bold text-black">5</p>
                    <p className="text-sm text-zinc-500">Media Files</p>
                  </div>
                  <div className="p-4 bg-zinc-50 rounded-lg text-center border border-zinc-200">
                    <Download className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
                    <p className="text-2xl font-bold text-black">0</p>
                    <p className="text-sm text-zinc-500">Downloaded Resources</p>
                  </div>
                </div>
                
                <Separator className="bg-zinc-200" />
                
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start border-[#c084fc] text-[#c084fc] hover:bg-[#c084fc] hover:text-white" data-testid="button-clear-cache">
                    <HardDrive className="w-4 h-4 mr-2 text-zinc-600" />
                    Clear Cached Files
                    <span className="ml-auto text-sm text-zinc-500">1.2 MB</span>
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-[#c084fc] text-[#c084fc] hover:bg-[#c084fc] hover:text-white" data-testid="button-manage-media">
                    <Image className="w-4 h-4 mr-2 text-zinc-600" />
                    Manage Media Uploads
                    <span className="ml-auto text-sm text-zinc-500">1.3 MB</span>
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-[#c084fc] text-[#c084fc] hover:bg-[#c084fc] hover:text-white" data-testid="button-downloaded">
                    <Download className="w-4 h-4 mr-2 text-zinc-600" />
                    Downloaded Resources
                    <span className="ml-auto text-sm text-zinc-500">0 MB</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="legal">
            <Card className="bg-white border border-zinc-200 shadow-sm rounded-xl">
              <CardHeader className="border-b border-zinc-200 pb-4">
                <CardTitle className="flex items-center gap-2 text-black">
                  <FileText className="w-5 h-5 text-[#c084fc]" />
                  Legal & Support
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-4">
                  <div 
                    className="p-4 bg-purple-50 rounded-lg border border-[#c084fc] cursor-pointer hover:bg-purple-100 transition-colors"
                    onClick={() => toggleLegalSection('userAgreement')}
                    data-testid="legal-user-agreement"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-black">User Agreement</h3>
                        <p className="text-sm text-zinc-500">Effective Date: Jan 16 2026</p>
                      </div>
                      {expandedLegalSections.userAgreement ? (
                        <ChevronUp className="w-5 h-5 text-[#c084fc]" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-[#c084fc]" />
                      )}
                    </div>
                    {expandedLegalSections.userAgreement && (
                      <div className="mt-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar text-sm text-zinc-600 space-y-3">
                        <p>This User Agreement ("Agreement" or "Contract") governs your access to and use of the Music Industry Connect platform, including our website, mobile applications, membership services, content, features, events, and any related services (collectively, the "Services").</p>
                        <p>By creating an account, accessing, or using our Services, you agree to be bound by this Agreement, our Community Guidelines, Privacy Policy, and any other policies or notices we provide (collectively, the "Policies"). If you do not agree, do not use the Services.</p>
                        
                        <p><strong className="text-black">1. Eligibility and Acceptance</strong></p>
                        <p>You must be at least the minimum legal age required to form a binding contract in your jurisdiction (the "Minimum Age") to use the Services. By using the Services, you represent and warrant that you are legally eligible to enter into this Agreement.</p>
                        
                        <p><strong className="text-black">2. Account Registration and Security</strong></p>
                        <p>You agree to provide accurate, current, and complete information when creating and maintaining your account. You are responsible for maintaining the confidentiality of your password and account credentials. You may not share your account with any other person or allow others to access your account. You are responsible for all activity that occurs under your account.</p>
                        
                        <p><strong className="text-black">3. Community Standards and Acceptable Use</strong></p>
                        <p>You agree to comply with all applicable laws and to follow Music Industry Connect's Community Guidelines, which are built on the following principles:</p>
                        <p><strong className="text-black">A. Be Safe</strong> - You will not post or share harassing, abusive, threatening, or violent content; incite, promote, or glorify violence or criminal activity; share material depicting the exploitation or abuse of children; promote, sell, or attempt to purchase illegal, unsafe, or regulated goods or services; or promote or support dangerous individuals, groups, or organizations.</p>
                        <p><strong className="text-black">B. Be Trustworthy</strong> - You will not share false, misleading, or deceptive information; create fake accounts or impersonate another person or entity; falsify your identity, credentials, experience, or affiliations; or engage in fraud, scams, or deceptive practices.</p>
                        <p><strong className="text-black">C. Be Professional</strong> - You will not engage in hateful or discriminatory conduct; make unwanted sexual advances or inappropriate sexual content; share shocking, graphic, or harmful material; or spam members or misuse the platform for excessive self-promotion or solicitation.</p>
                        
                        <p><strong className="text-black">4. Your Content and Information</strong></p>
                        <p>You retain ownership of any original content, information, or materials you post, upload, or submit through the Services ("User Content"). You represent and warrant that you have all necessary rights to share any User Content you provide. You grant Music Industry Connect a non-exclusive, worldwide, royalty-free, transferable, and sublicensable license to use, host, store, reproduce, distribute, display, modify, and create derivative works of your User Content solely for operating, improving, promoting, and providing the Services.</p>
                        
                        <p><strong className="text-black">5. AI-Generated and Platform-Generated Content</strong></p>
                        <p>Music Industry Connect may provide tools or features that generate content, recommendations, or suggestions, including those powered by artificial intelligence. You agree to review, edit, and verify any AI-generated or automated content before sharing it. You remain solely responsible for any content you choose to post or share.</p>
                        
                        <p><strong className="text-black">6. Use of Others' Content</strong></p>
                        <p>Your use of content shared by other users or third parties is at your own risk. Music Industry Connect does not endorse or guarantee third-party content, products, services, or opportunities offered through the Services.</p>
                        
                        <p><strong className="text-black">7. Paid Services, Memberships, and Payments</strong></p>
                        <p>Certain features or memberships may require payment. You agree to pay all applicable fees, taxes, and charges associated with paid Services. You authorize us to store and process your payment information through our payment providers. Prices, fees, and available plans may change prospectively. Refunds, if any, are subject to our posted refund policy.</p>
                        
                        <p><strong className="text-black">8. Communications and Notices</strong></p>
                        <p>You consent to receive communications, notices, and messages from Music Industry Connect through the Services, email, or other contact information you provide. You are responsible for keeping your contact information current and accurate.</p>
                        
                        <p><strong className="text-black">9. Privacy and Data Use</strong></p>
                        <p>Your use of the Services is subject to our Privacy Policy, which explains how we collect, use, share, and store personal data. You acknowledge that we may use data and information about you to personalize experiences, provide recommendations, improve Services, and generate content for you and others, consistent with our Privacy Policy.</p>
                        
                        <p><strong className="text-black">10. Service Availability and Changes</strong></p>
                        <p>Music Industry Connect may modify, suspend, or discontinue any part of the Services at any time. We may limit the availability of certain features, content, or Services, including based on membership level or geographic location. We may update this Agreement or our prices from time to time. Changes will apply prospectively from the effective date of the update.</p>
                        
                        <p><strong className="text-black">11. Termination</strong></p>
                        <p>You may terminate this Agreement at any time by closing your account. We may suspend or terminate your access to the Services for violations of this Agreement, the Policies, or applicable law. Certain provisions of this Agreement will survive termination, including content licenses, disclaimers, limitation of liability, and dispute resolution.</p>
                        
                        <p><strong className="text-black">12. Disclaimers</strong></p>
                        <p>The Services are provided "as is" and "as available." Music Industry Connect disclaims all warranties, express or implied, including warranties of merchantability, fitness for a particular purpose, and non-infringement.</p>
                        
                        <p><strong className="text-black">13. Limitation of Liability</strong></p>
                        <p>To the maximum extent permitted by law, Music Industry Connect shall not be liable for indirect, incidental, consequential, special, or punitive damages. Our total liability arising out of or related to the Services shall be limited as permitted by applicable law.</p>
                        
                        <p><strong className="text-black">14. Dispute Resolution and Governing Law</strong></p>
                        <p>Any legal disputes arising from this Agreement shall be governed by the laws and courts specified in this Agreement. You agree to submit to the exclusive jurisdiction of the applicable courts as identified herein.</p>
                        
                        <p><strong className="text-black">15. General Terms</strong></p>
                        <p>This Agreement constitutes the entire agreement between you and Music Industry Connect regarding the Services. If any provision is found unenforceable, the remaining provisions will remain in effect. Our failure to enforce any right or provision does not constitute a waiver.</p>
                      </div>
                    )}
                  </div>

                  <div 
                    className="p-4 bg-purple-50 rounded-lg border border-[#c084fc] cursor-pointer hover:bg-purple-100 transition-colors"
                    onClick={() => toggleLegalSection('privacyPolicy')}
                    data-testid="legal-privacy-policy"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-black">Privacy Policy</h3>
                        <p className="text-sm text-zinc-500">Effective Date: Jan 16 2026</p>
                      </div>
                      {expandedLegalSections.privacyPolicy ? (
                        <ChevronUp className="w-5 h-5 text-[#c084fc]" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-[#c084fc]" />
                      )}
                    </div>
                    {expandedLegalSections.privacyPolicy && (
                      <div className="mt-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar text-sm text-zinc-600 space-y-3">
                        <p>Your privacy matters to Music Industry Connect ("MIC," "we," "us," or "our"). Our mission is to support music creators, industry professionals, and organizations by providing a trusted platform for connection, collaboration, education, and opportunity. Central to that mission is transparency about the data we collect, how we use it, and with whom we share it.</p>
                        <p>This Privacy Policy applies when you use Music Industry Connect's websites, mobile applications, memberships, events, tools, content, and related services (collectively, the "Services"). It should be read together with our User Agreement, Community Guidelines, and any other policies we reference. By using our Services, you agree to the collection, use, and sharing of your personal data as described in this Privacy Policy.</p>
                        
                        <p><strong className="text-black">1. Scope and Definitions</strong></p>
                        <p><strong className="text-black">Members and Visitors:</strong> Members are registered users of Music Industry Connect. Visitors are individuals who access public portions of the Services without registering. This Privacy Policy applies to both Members and Visitors, though certain features and data uses apply only to Members.</p>
                        <p><strong className="text-black">Geographic Scope:</strong> If you are located in the United States, your data is processed primarily under U.S. law. If you are located in other regions (including the EU, EEA, UK, or Switzerland), additional rights may apply under local data protection laws.</p>
                        
                        <p><strong className="text-black">2. Data We Collect</strong></p>
                        <p><strong className="text-black">2.1 Data You Provide Directly:</strong> Registration data (name, email address, password, general location); Profile data (professional role, music-related skills, genres, experience, education, affiliations, profile photo, bio, links); Payment data (billing details and payment information processed by third-party payment providers); Communications (messages, posts, comments, event participation, survey responses, and customer support requests).</p>
                        <p><strong className="text-black">2.2 Data From Others:</strong> We may receive data about you when other Members mention, tag, message, or invite you; organizations, partners, or event hosts provide information; or third-party integrations you choose to connect share data with us.</p>
                        <p><strong className="text-black">2.3 Usage and Technical Data:</strong> Log data (pages viewed, features used, searches, clicks, timestamps); Device and connection data (IP address, browser type, operating system, device identifiers); Approximate location derived from IP address.</p>
                        <p><strong className="text-black">2.4 Cookies and Similar Technologies:</strong> We use cookies, pixels, and similar technologies to authenticate users, remember preferences, analyze usage, improve performance, and deliver relevant content and communications.</p>
                        
                        <p><strong className="text-black">3. How We Use Your Data</strong></p>
                        <p><strong className="text-black">3.1 Provide and Operate the Services:</strong> Create and manage accounts; Enable networking, messaging, posting, events, and opportunities; Authenticate access and enforce our policies.</p>
                        <p><strong className="text-black">3.2 Personalization and Recommendations:</strong> Suggest connections, content, events, opportunities, or resources; Highlight skills, genres, or experiences relevant to your interests.</p>
                        <p><strong className="text-black">3.3 Communications:</strong> Send service-related messages (security, updates, confirmations); Send newsletters, announcements, and promotional communications (you may opt out of marketing messages).</p>
                        <p><strong className="text-black">3.4 Paid Services and Transactions:</strong> Process payments; Manage subscriptions, memberships, and event registrations; Provide receipts and account notices.</p>
                        <p><strong className="text-black">3.5 Analytics, Research, and Development:</strong> Analyze platform usage and trends; Improve existing features and develop new ones; Produce aggregated, de-identified insights about the music industry and our community.</p>
                        <p><strong className="text-black">3.6 Artificial Intelligence and Automated Tools:</strong> We may use automated systems, including AI-powered tools, to recommend content or connections, assist with moderation, safety, and fraud prevention, and generate drafts, suggestions, or insights. You are responsible for reviewing and approving any AI-generated content you choose to share.</p>
                        <p><strong className="text-black">3.7 Safety, Security, and Legal Compliance:</strong> Prevent fraud, abuse, and policy violations; Protect the rights, safety, and integrity of MIC, our Members, and others; Comply with legal obligations.</p>
                        
                        <p><strong className="text-black">4. How We Share Information</strong></p>
                        <p><strong className="text-black">4.1 Within the Services:</strong> Profile information and content you choose to share may be visible to other Members or the public, depending on your settings.</p>
                        <p><strong className="text-black">4.2 Service Providers:</strong> We share data with trusted third-party service providers who help us operate our Services (e.g., hosting, analytics, payments, customer support).</p>
                        <p><strong className="text-black">4.3 Partners and Integrations:</strong> If you connect your account to third-party tools or participate in partner programs, we may share limited data as needed to provide those features.</p>
                        <p><strong className="text-black">4.4 Legal and Safety Disclosures:</strong> We may disclose information to comply with law or legal process, enforce our agreements and policies, or protect the rights, safety, or property of MIC, our Members, or others.</p>
                        <p><strong className="text-black">4.5 Business Transfers:</strong> If Music Industry Connect is involved in a merger, acquisition, or sale of assets, personal data may be transferred as part of that transaction.</p>
                        
                        <p><strong className="text-black">5. Your Choices and Rights</strong></p>
                        <p><strong className="text-black">5.1 Access, Update, and Control:</strong> You can access and edit your profile information, manage visibility and communication preferences, and opt out of certain marketing communications.</p>
                        <p><strong className="text-black">5.2 Data Requests:</strong> Subject to applicable law, you may request to access your personal data, correct inaccurate data, delete your data, restrict or object to certain processing, or receive a copy of your data in a portable format.</p>
                        
                        <p><strong className="text-black">6. Data Retention</strong></p>
                        <p>We retain personal data as long as your account is active or as needed to provide Services. After account closure, we may retain certain data where required for legal compliance, dispute resolution, security, or fraud prevention.</p>
                        
                        <p><strong className="text-black">7. Account Closure</strong></p>
                        <p>When you close your account, your profile will no longer be publicly visible within a reasonable period. Content you shared with others may remain visible to those recipients. We do not control copies made by other users or third parties.</p>
                        
                        <p><strong className="text-black">8. Security</strong></p>
                        <p>We implement reasonable technical and organizational measures to protect your data. However, no system is completely secure, and we cannot guarantee absolute security.</p>
                        
                        <p><strong className="text-black">9. International Data Transfers</strong></p>
                        <p>Your data may be processed and stored in the United States or other countries. These countries may have different data protection laws than your jurisdiction. We use lawful mechanisms to protect cross-border transfers where required.</p>
                        
                        <p><strong className="text-black">10. Changes to This Privacy Policy</strong></p>
                        <p>We may update this Privacy Policy from time to time. Material changes will be communicated through the Services or other appropriate means. Continued use of the Services after the effective date constitutes acceptance of the updated policy.</p>
                      </div>
                    )}
                  </div>

                  <div 
                    className="p-4 bg-purple-50 rounded-lg border border-[#c084fc] cursor-pointer hover:bg-purple-100 transition-colors"
                    onClick={() => toggleLegalSection('communityPolicy')}
                    data-testid="legal-community-policy"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-black">Professional Community Policy</h3>
                        <p className="text-sm text-zinc-500">Effective Date: Jan 16 2026</p>
                      </div>
                      {expandedLegalSections.communityPolicy ? (
                        <ChevronUp className="w-5 h-5 text-[#c084fc]" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-[#c084fc]" />
                      )}
                    </div>
                    {expandedLegalSections.communityPolicy && (
                      <div className="mt-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar text-sm text-zinc-600 space-y-3">
                        <p><strong className="text-black">Our Community Purpose</strong></p>
                        <p>Music Industry Connect ("MIC") is a professional community where music creators, industry professionals, and organizations come together to build careers, share opportunities, learn, collaborate, and grow sustainable businesses in music. All content and interactions on MIC should contribute constructively to a safe, trustworthy, and professional environment.</p>
                        <p>These Professional Community Policies apply to all members, users, partners, and organizations using MIC's websites, applications, tools, and services (the "Services"). By using MIC, you agree to comply with these policies, our User Agreement, and our Privacy Policy.</p>
                        
                        <p><strong className="text-black">Reporting Content and Behavior</strong></p>
                        <p>If you see content or behavior that you believe violates these policies - including profiles, posts, messages, comments, event listings, or opportunities - please report it using MIC's reporting tools. Reports help us identify and address abuse, misinformation, fraud, and other harmful behavior. Please use reporting tools responsibly and only for their intended purpose.</p>
                        <p>MIC uses a combination of trained reviewers and automated systems to detect and review potentially violative content. Content or accounts that violate these policies may be limited, labeled, removed, or restricted.</p>
                        
                        <p><strong className="text-black">Enforcement and Consequences</strong></p>
                        <p>These policies apply to everyone on MIC. Depending on the severity, frequency, or nature of a violation, MIC may: Remove or limit the visibility of content; Label content with warnings; Restrict messaging or interaction features; Suspend or permanently terminate accounts. Repeated or egregious violations may result in permanent removal from the platform. If you believe enforcement action was taken in error, you may submit an appeal.</p>
                        
                        <p><strong className="text-black">Community Standards</strong></p>
                        <p>Our policies are organized around three core principles: Be Safe, Be Trustworthy, and Be Professional.</p>
                        
                        <p><strong className="text-black">Be Safe</strong></p>
                        <p>Only bring safe conversations and content to Music Industry Connect.</p>
                        <p><strong className="text-black">Harassment and Abuse:</strong> Do not post or engage in harassment, bullying, intimidation, shaming, or abusive language. This includes targeted attacks, threats, repeated unwanted contact, trolling, or encouraging others to harass someone. Do not disclose or threaten to disclose another person's private or sensitive information (doxing).</p>
                        <p><strong className="text-black">Violence and Threats:</strong> Do not threaten, incite, glorify, or promote violence, property damage, or criminal activity. Organizations or individuals that engage in or promote violence are not permitted on MIC.</p>
                        <p><strong className="text-black">Child Safety:</strong> MIC has zero tolerance for content involving the sexual exploitation or abuse of children. Do not create, share, solicit, or facilitate such material in any form. When required, MIC may report apparent violations to appropriate authorities.</p>
                        <p><strong className="text-black">Illegal or Dangerous Goods and Services:</strong> Do not promote, sell, solicit, or facilitate illegal or dangerous goods or services. This includes fake credentials, forged documents, stolen data, scams, proxy services, prostitution, escort services, or exploiting tragedies for commercial gain.</p>
                        <p><strong className="text-black">Dangerous Organizations and Individuals:</strong> Do not promote, support, or affiliate with terrorist organizations, violent extremist groups, or criminal organizations. Content intended to recruit, praise, or assist such groups is prohibited.</p>
                        
                        <p><strong className="text-black">Be Trustworthy</strong></p>
                        <p>MIC is built on authenticity, transparency, and real professional relationships.</p>
                        <p><strong className="text-black">Accuracy and Misinformation:</strong> Do not share false, misleading, or deceptive content. This includes manipulated or synthetic media presented as real without disclosure, health misinformation, election interference, or undisclosed paid endorsements.</p>
                        <p><strong className="text-black">Authentic Identity:</strong> You must use your real identity and provide accurate information about yourself, your work, credentials, affiliations, and experience. Do not create fake profiles, impersonate others, or misrepresent your professional background. You may not share accounts or access someone else's account.</p>
                        <p><strong className="text-black">Scams, Fraud, and Deception:</strong> Do not use MIC to scam, defraud, deceive, or exploit others. This includes romance scams, pyramid schemes, phishing, malware distribution, or misleading opportunity postings.</p>
                        
                        <p><strong className="text-black">Be Professional</strong></p>
                        <p>MIC is a professional music industry network. Members are expected to communicate with respect, integrity, and professionalism.</p>
                        <p><strong className="text-black">Hate and Discrimination:</strong> Do not post content that attacks, demeans, dehumanizes, or threatens individuals or groups based on protected characteristics such as race, ethnicity, nationality, gender, gender identity, sexual orientation, religion, age, or disability. Hate groups and hateful ideologies are not permitted.</p>
                        <p><strong className="text-black">Sexual Content and Unwanted Advances:</strong> MIC is not a dating platform. Do not engage in sexual innuendo, explicit content, unwanted romantic advances, or sexual commentary. Do not send sexually explicit images or messages or pursue romantic connections through the platform.</p>
                        <p><strong className="text-black">Harmful or Shocking Content:</strong> Do not share content that is excessively graphic, violent, or disturbing. This includes depictions of severe injury, sexual violence, nudity, criminal instruction, drug abuse, self-harm, or suicide. Content promoting or facilitating criminal activity, human trafficking, or exploitation is prohibited.</p>
                        <p><strong className="text-black">Spam and Platform Abuse:</strong> Do not spam members or the platform. This includes irrelevant or repetitive promotional messages, unsolicited invitations, engagement manipulation, automated messaging, or deceptive growth tactics. Content should be original, relevant, and valuable to the music industry community.</p>
                        
                        <p><strong className="text-black">Final Notes</strong></p>
                        <p>MIC reserves the right to limit interactions, features, or visibility to protect the integrity of the community. These policies may be updated from time to time, with changes taking effect prospectively. By participating in Music Industry Connect, you help create a professional, inclusive, and opportunity-driven space for the global music industry.</p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="my-6 bg-zinc-100" />

                <div className="space-y-3">
                  <a href="#" className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-[#c084fc] hover:bg-purple-100 transition-colors" data-testid="link-help">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-[#c084fc]" />
                      <span className="font-medium text-black">Help Center / FAQs</span>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-[#c084fc] rotate-180" />
                  </a>

                  <a href="#" className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-[#c084fc] hover:bg-purple-100 transition-colors" data-testid="link-contact">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-[#c084fc]" />
                      <span className="font-medium text-black">Contact Support</span>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-[#c084fc] rotate-180" />
                  </a>
                </div>

                <Separator className="my-6 bg-zinc-100" />

                <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                  <div className="flex items-start gap-3">
                    <Trash2 className="w-5 h-5 text-red-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-black">Delete Account</p>
                      <p className="text-sm text-zinc-500 mb-3">Permanently delete your account and all associated data. This action cannot be undone.</p>
                      <Button className="bg-[#c084fc] hover:bg-[#a855f7] text-white" data-testid="button-delete-account">
                        Delete My Account
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
