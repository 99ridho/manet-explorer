import { useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router'
import { MoonIcon, SunIcon } from 'lucide-react'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { AppSidebar } from './AppSidebar'

const THEME_KEY = 'manet-explorer-theme'

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY)
      if (stored) return stored === 'dark'
    } catch {
      /* storage unavailable */
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // index.css keys dark mode off the `.dark` class (SPEC.md §5).
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    try {
      localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light')
    } catch {
      /* storage unavailable */
    }
  }, [dark])

  return [dark, () => setDark((d) => !d)] as const
}

export function AppLayout() {
  const [dark, toggleDark] = useDarkMode()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger aria-label="Toggle sidebar" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Link to="/" className="font-semibold tracking-tight">
            MANET Interactive Explorer
          </Link>
          <div className="ml-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDark}
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-pressed={dark}
            >
              {dark ? <SunIcon /> : <MoonIcon />}
            </Button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-screen-2xl px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
