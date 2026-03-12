import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Mic, Home, Search, MessageCircle, UserPlus, LogIn, LogOut } from "lucide-react";
import micLogo from "@assets/MIC Logo 2_1752952044953.png";

export default function Navigation() {
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Check login status on mount and when location changes
  useEffect(() => {
    const userId = localStorage.getItem('currentUserId');
    setIsLoggedIn(!!userId);
  }, [location]);
  
  const handleLogout = () => {
    localStorage.removeItem('currentUserId');
    setIsLoggedIn(false);
    setLocation('/login');
  };

  const navItems = [
    { path: "/home", label: "Home", icon: Home },
    { path: "/directory", label: "Directory", icon: Search },
    { path: "/core", label: "Core", icon: MessageCircle },
    ...(isLoggedIn ? [] : [{ path: "/join", label: "Join", icon: UserPlus }]),
  ];

  const isActive = (path: string) => location === path;

  const NavLinks = ({ mobile = false, onItemClick = () => {} }) => (
    <div className={`flex ${mobile ? 'flex-col space-y-2' : 'space-x-1 lg:space-x-6'}`}>
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.path} href={item.path}>
            <Button
              variant={isActive(item.path) ? "secondary" : "ghost"}
              className={`${mobile ? 'w-full justify-start' : ''} ${
                mobile 
                  ? (isActive(item.path) 
                      ? 'bg-[#c084fc]/10 text-[#c084fc] font-medium border border-[#c084fc]/20' 
                      : 'text-gray-700 hover:bg-[#c084fc]/10 hover:text-[#c084fc] font-medium')
                  : (isActive(item.path) 
                      ? 'bg-white bg-opacity-20 text-white font-medium px-2 lg:px-4 text-sm lg:text-base' 
                      : 'text-white hover:bg-white hover:bg-opacity-20 font-medium px-2 lg:px-4 text-sm lg:text-base')
              }`}
              onClick={onItemClick}
            >
              <Icon className="w-4 h-4 mr-1 lg:mr-2" />
              {item.label}
            </Button>
          </Link>
        );
      })}
    </div>
  );

  return (
    <header className="bg-[#B084C9] text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center py-3 sm:py-4">
          {/* Logo */}
          <Link href="/home">
            <div className="flex items-center hover:opacity-80 transition-opacity">
              <img 
                src={micLogo} 
                alt="MIC Logo" 
                className="h-10 sm:h-12 w-auto"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex bg-white bg-opacity-20 rounded-lg px-2 lg:px-4 py-2">
            <NavLinks />
          </nav>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {isLoggedIn ? (
              <Button 
                onClick={handleLogout}
                className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white font-medium px-4 lg:px-6 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-sm lg:text-base"
              >
                <LogOut className="w-4 h-4 mr-1 lg:mr-2" />
                Logout
              </Button>
            ) : (
              <>
                <Link href="/login">
                  <Button className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white font-medium px-4 lg:px-6 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-sm lg:text-base">
                    <LogIn className="w-4 h-4 mr-1 lg:mr-2" />
                    Login
                  </Button>
                </Link>
                <Link href="/join">
                  <Button className="bg-white text-[#c084fc] hover:bg-gray-50 font-medium px-4 lg:px-6 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-[#c084fc]/30 text-sm lg:text-base">
                    <UserPlus className="w-4 h-4 mr-1 lg:mr-2" />
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center space-x-2 sm:hidden">
            {isLoggedIn ? (
              <Button 
                size="sm" 
                onClick={handleLogout}
                className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white font-medium text-xs px-3 py-1.5 rounded-lg shadow-md transition-all duration-300"
              >
                Logout
              </Button>
            ) : (
              <Link href="/login">
                <Button size="sm" className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white font-medium text-xs px-3 py-1.5 rounded-lg shadow-md transition-all duration-300">
                  Login
                </Button>
              </Link>
            )}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white hover:bg-opacity-20 p-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-white border-[#c084fc]/20">
                <div className="flex flex-col space-y-4 mt-8">
                  <NavLinks mobile onItemClick={() => setIsOpen(false)} />
                  <div className="border-t border-[#c084fc]/20 pt-4 space-y-3">
                    {isLoggedIn ? (
                      <Button 
                        className="w-full bg-[#c084fc] hover:bg-[#c084fc]/90 text-white font-medium py-3 rounded-xl shadow-md transition-all duration-300" 
                        onClick={() => { handleLogout(); setIsOpen(false); }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    ) : (
                      <>
                        <Link href="/login">
                          <Button className="w-full bg-[#c084fc] hover:bg-[#c084fc]/90 text-white font-medium py-3 rounded-xl shadow-md transition-all duration-300" onClick={() => setIsOpen(false)}>
                            <LogIn className="w-4 h-4 mr-2" />
                            Login
                          </Button>
                        </Link>
                        <Link href="/join">
                          <Button className="w-full bg-white text-[#c084fc] hover:bg-gray-50 font-medium py-3 rounded-xl shadow-md border border-[#c084fc]/30 transition-all duration-300" onClick={() => setIsOpen(false)}>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Sign Up
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
