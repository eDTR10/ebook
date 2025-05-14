import { useState, useEffect } from "react";
import { ThemeProvider } from "@/components/theme-provider"
import {

  LogOut,
  Menu,
  X,
  ArrowUpCircle,
  ArrowDownCircle,
  Home,
  Megaphone
} from "lucide-react"
import { Link, Outlet,useNavigate } from "react-router-dom"
// import { ModeToggle } from "@/components/mode-toggle";
import LOGO from "./../../assets/logo/DICT-Logo-Final-2-300x153.png"
function Admin() {
  const navigate = useNavigate(); // Add this hook
  const [isOpen, setIsOpen] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(false);


  const handleLogout = () => {
    // Clear all items from localStorage
    localStorage.clear();
    // Navigate to login page
    navigate('/ebes');
  };

  // Screen size detection
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 767) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll detection
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      const scrollTop = target.scrollTop;
      const scrollHeight = target.scrollHeight;
      const clientHeight = target.clientHeight;

      const isBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight - 10;
      setIsAtBottom(isBottom);
    };

    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.addEventListener('scroll', handleScroll);
      return () => mainContent.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleScroll = () => {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      if (isAtBottom) {
        mainContent.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        mainContent.scrollTo({ top: mainContent.scrollHeight, behavior: 'smooth' });
      }
    }
  };

  // Update the helper function to check active routes more precisely
  const isActiveRoute = (path: string) => {
    // Special case for dashboard since it's the main route
    if (path === '/ebes/admin/home/') {
      return location.pathname === '/ebes/admin/home/' || location.pathname === '/ebes/admin/home/';
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    {
      label: "Event Calendar",
      icon: <Home className="w-5 h-5" />,
      href: "/ebes/admin/home/"
    },
    { label: "Events", icon: <Megaphone className="w-5 h-5" />, href: "/ebes/admin/events/" },
  ];

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="relative bg-background h-screen w-screen flex overflow-hidden">

        {/* <div className=" fixed top-0 right-0 p-4 z-50">
            <ModeToggle/>
        </div> */}
        {/* Burger Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:block hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-primary text-white"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Sidebar Navigation */}
        <nav className={`
          z-40 bg-[#0134b2] border-r border-border
          w-[20vw] md:w-[300px] h-full md:absolute relative 
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'fixed -translate-x-full'}
        `}>
          {/* Logo */}
          <div className="p-6 mt-5 flex flex-col items-center justify-center">
            <img
              src={LOGO}
              alt="ebes Logo"
              className="h-40 w-auto"
            />
            {/* <h2 className="text-xl font-bold text-white mt-2">
              <span className="text-red-500">e</span><span className=" text-white ">BES</span>
            </h2>
            <p className="text-xs text-white/70 mt-1 uppercase text-center">
              electronic Booking Event System
            </p> */}

            <p className=" bg-white text-[9px] p-1 rounded-[5px] border border-border mb-2">
              Misamis Oriental
            </p>
            <p className="text-xs text-white/70 mt-1 uppercase text-center">
              electronic Booking Event System
            </p>
          </div>

          <hr className="mx-4" />

          {/* Navigation Items */}
          <div className="px-4 space-y-2 pt-5">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-colors duration-200
                  ${isActiveRoute(item.href)
                    ? ' bg-slate-800 text-white font-medium'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'}
                `}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Logout Button */}
          <div className="absolute bottom-8 left-0 right-0 px-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-white/70 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <main className={`
          flex-1 transition-all  duration-300 ease-in-out
          ${isOpen ? '' : 'ml-0'}
          z-30 min-h-[300px] flex flex-col gap-2 overflow-y-scroll relative
        `}
          onClick={() => {
            if (window.innerWidth <= 767) {
              setIsOpen(false)
            }
          }}
        >
          <Outlet />

          {/* Scroll Button */}
          <button
            onClick={handleScroll}
            className="animate__animated animate__bounceIn fixed bottom-8 right-8 z-50 px-4 py-2 rounded-lg bg-primary/10 backdrop-blur-sm transition-all duration-300 flex items-center gap-2"
            aria-label={isAtBottom ? "Scroll to top" : "Scroll to bottom"}
          >
            <span className="text-primary text-sm font-medium">
              {isAtBottom ? "Scroll to top" : "Scroll down, there's more to see!"}
            </span>
            {isAtBottom ? (
              <ArrowUpCircle className="text-primary" size={20} />
            ) : (
              <ArrowDownCircle className="text-primary" size={20} />
            )}
          </button>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default Admin;