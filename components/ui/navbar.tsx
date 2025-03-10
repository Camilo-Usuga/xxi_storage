"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { Home, LogIn, LogOut, User, FileUp, Menu, X } from "lucide-react"
import { useState } from "react"

export function Navbar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const navItems = [
    { name: "Home", href: "/", icon: <Home className="h-5 w-5 mr-2" /> },
    { name: "Upload", href: "/upload", icon: <FileUp className="h-5 w-5 mr-2" /> },
    { name: "Account", href: "/account", icon: <User className="h-5 w-5 mr-2" /> },
  ]

  return (
    <nav className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-primary">
                XXI Storage
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {user &&
                navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname === item.href
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
                    }`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <Button variant="outline" onClick={logout} className="flex items-center">
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </Button>
            ) : (
              <div className="flex space-x-4">
                <Button variant="outline" asChild>
                  <Link href="/login" className="flex items-center">
                    <LogIn className="h-5 w-5 mr-2" />
                    Login
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {user &&
              navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    pathname === item.href
                      ? "border-primary text-primary bg-primary/10"
                      : "border-transparent text-muted-foreground hover:bg-muted hover:border-gray-300 hover:text-foreground"
                  }`}
                  onClick={closeMenu}
                >
                  <div className="flex items-center">
                    {item.icon}
                    {item.name}
                  </div>
                </Link>
              ))}
            {user ? (
              <button
                onClick={() => {
                  logout()
                  closeMenu()
                }}
                className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-muted-foreground hover:bg-muted hover:border-gray-300 hover:text-foreground"
              >
                <div className="flex items-center">
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </div>
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-muted-foreground hover:bg-muted hover:border-gray-300 hover:text-foreground"
                  onClick={closeMenu}
                >
                  <div className="flex items-center">
                    <LogIn className="h-5 w-5 mr-2" />
                    Login
                  </div>
                </Link>
                <Link
                  href="/register"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-muted-foreground hover:bg-muted hover:border-gray-300 hover:text-foreground"
                  onClick={closeMenu}
                >
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Register
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

