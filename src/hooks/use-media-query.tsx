import { useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)
  
  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query)
      
      // Set initial value
      setMatches(media.matches)
      
      // Define update function
      const updateMatches = (e: MediaQueryListEvent) => {
        setMatches(e.matches)
      }
      
      // Add event listener for changes
      media.addEventListener('change', updateMatches)
      
      // Clean up function
      return () => {
        media.removeEventListener('change', updateMatches)
      }
    }
  }, [query])
  
  return matches
}