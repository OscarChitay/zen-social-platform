import { Link } from 'react-router-dom';
import { Home, Search, PlusSquare, Heart, User, Menu, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import clsx from 'clsx';
import logo1 from '../assets/images/logo1.png'; // Logo claro
import logo2 from '../assets/images/logo 2.png'; // Logo oscuro (nota el espacio)

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 surface border-b border-default">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - texto ZEN + imagen a la derecha */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
          >
            <div className="relative flex items-center gap-2">
              <div className="absolute inset-0 bg-gradient-github rounded-lg blur-md opacity-60 group-hover:opacity-100 transition-opacity"></div>
              <h1 className="relative text-xl font-bold bg-gradient-github bg-clip-text text-transparent">
                ZEN
              </h1>
              <img
                src={theme === 'dark' ? logo1 : logo2}
                alt="ZEN Logo"
                className="relative h-7 w-auto object-contain"
              />
            </div>
          </Link>

          {/* Desktop Navigation - Centro */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/" icon={Home} label="Inicio" />
            <NavLink to="/search" icon={Search} label="Buscar" />
            <NavLink to="/create" icon={PlusSquare} label="Crear" />
            <NavLink to="/notifications" icon={Heart} label="Notificaciones" />
            <NavLink to="/profile" icon={User} label="Perfil" />
          </div>

          {/* Right Side - Theme Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={clsx(
                "p-2 rounded-full transition-all duration-300",
                "hover:bg-light-border dark:hover:bg-dark-border",
                "active:scale-95"
              )}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-500 animate-scale-in" />
              ) : (
                <Moon className="w-5 h-5 text-primary animate-scale-in" />
              )}
            </button>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 rounded-full hover:bg-light-border dark:hover:bg-dark-border transition-colors">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, icon, label }) {
  const Icon = icon;
  return (
    <Link
      to={to}
      className={clsx(
        "flex flex-col items-center gap-1 group relative",
        "transition-all duration-200"
      )}
    >
      <div className="p-2 rounded-full group-hover:bg-light-border dark:group-hover:bg-dark-border transition-colors">
        <Icon className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
      </div>
      <span className="text-xs text-secondary group-hover:text-primary transition-colors">
        {label}
      </span>
      {/* Active indicator */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </Link>
  );
}
