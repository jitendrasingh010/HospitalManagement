import { useEffect, useState } from 'react'

const getSavedTheme = () => {
  return localStorage.getItem('theme') || 'light'
}

const useTheme = () => {
  const [theme, setTheme] = useState(getSavedTheme)

  useEffect(() => {
    document.body.classList.remove('light', 'dark')
    document.body.classList.add(theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return { theme, toggleTheme }
}

export { useTheme }
export default useTheme
