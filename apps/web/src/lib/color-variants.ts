/**
 * Maps Chakra-style colorScheme names to Tailwind class sets.
 * Used for dynamic color theming where Tailwind JIT can't resolve
 * template-literal class names at build time.
 */

export type ColorScheme =
  | 'green'
  | 'blue'
  | 'purple'
  | 'orange'
  | 'red'
  | 'teal'
  | 'yellow'
  | 'gray';

interface ColorClasses {
  badge: string;
  badgeOutline: string;
  button: string;
  buttonOutline: string;
  buttonGhost: string;
  progress: string;
  text600: string;
  bg50: string;
  border200: string;
  border300: string;
  border400: string;
  border500: string;
}

const colorMap: Record<ColorScheme, ColorClasses> = {
  green: {
    badge: 'bg-dengrow-50 text-dengrow-800',
    badgeOutline: 'border-dengrow-300 text-dengrow-700',
    button:
      'bg-dengrow-500 text-white hover:bg-dengrow-600 shadow-sm hover:shadow-glow',
    buttonOutline:
      'border-dengrow-500 text-dengrow-500 hover:bg-dengrow-50',
    buttonGhost: 'text-dengrow-500 hover:bg-dengrow-50',
    progress: 'bg-dengrow-500',
    text600: 'text-dengrow-600',
    bg50: 'bg-dengrow-50',
    border200: 'border-dengrow-200',
    border300: 'border-dengrow-300',
    border400: 'border-dengrow-400',
    border500: 'border-dengrow-500',
  },
  blue: {
    badge: 'bg-blue-50 text-blue-700',
    badgeOutline: 'border-blue-300 text-blue-700',
    button: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
    buttonOutline: 'border-blue-600 text-blue-600 hover:bg-blue-50',
    buttonGhost: 'text-blue-600 hover:bg-blue-50',
    progress: 'bg-blue-500',
    text600: 'text-blue-600',
    bg50: 'bg-blue-50',
    border200: 'border-blue-200',
    border300: 'border-blue-300',
    border400: 'border-blue-400',
    border500: 'border-blue-500',
  },
  purple: {
    badge: 'bg-purple-50 text-purple-700',
    badgeOutline: 'border-purple-300 text-purple-700',
    button: 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm',
    buttonOutline:
      'border-purple-600 text-purple-600 hover:bg-purple-50',
    buttonGhost: 'text-purple-600 hover:bg-purple-50',
    progress: 'bg-purple-500',
    text600: 'text-purple-600',
    bg50: 'bg-purple-50',
    border200: 'border-purple-200',
    border300: 'border-purple-300',
    border400: 'border-purple-400',
    border500: 'border-purple-500',
  },
  orange: {
    badge: 'bg-orange-50 text-orange-700',
    badgeOutline: 'border-orange-300 text-orange-700',
    button: 'bg-orange-500 text-white hover:bg-orange-600 shadow-sm',
    buttonOutline:
      'border-orange-500 text-orange-600 hover:bg-orange-50',
    buttonGhost: 'text-orange-600 hover:bg-orange-50',
    progress: 'bg-orange-500',
    text600: 'text-orange-600',
    bg50: 'bg-orange-50',
    border200: 'border-orange-200',
    border300: 'border-orange-300',
    border400: 'border-orange-400',
    border500: 'border-orange-500',
  },
  red: {
    badge: 'bg-red-50 text-red-700',
    badgeOutline: 'border-red-300 text-red-700',
    button: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    buttonOutline: 'border-red-600 text-red-600 hover:bg-red-50',
    buttonGhost: 'text-red-600 hover:bg-red-50',
    progress: 'bg-red-500',
    text600: 'text-red-600',
    bg50: 'bg-red-50',
    border200: 'border-red-200',
    border300: 'border-red-300',
    border400: 'border-red-400',
    border500: 'border-red-500',
  },
  teal: {
    badge: 'bg-teal-50 text-teal-700',
    badgeOutline: 'border-teal-300 text-teal-700',
    button: 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm',
    buttonOutline: 'border-teal-600 text-teal-600 hover:bg-teal-50',
    buttonGhost: 'text-teal-600 hover:bg-teal-50',
    progress: 'bg-teal-500',
    text600: 'text-teal-600',
    bg50: 'bg-teal-50',
    border200: 'border-teal-200',
    border300: 'border-teal-300',
    border400: 'border-teal-400',
    border500: 'border-teal-500',
  },
  yellow: {
    badge: 'bg-yellow-50 text-yellow-700',
    badgeOutline: 'border-yellow-300 text-yellow-700',
    button: 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-sm',
    buttonOutline:
      'border-yellow-500 text-yellow-600 hover:bg-yellow-50',
    buttonGhost: 'text-yellow-600 hover:bg-yellow-50',
    progress: 'bg-yellow-500',
    text600: 'text-yellow-600',
    bg50: 'bg-yellow-50',
    border200: 'border-yellow-200',
    border300: 'border-yellow-300',
    border400: 'border-yellow-400',
    border500: 'border-yellow-500',
  },
  gray: {
    badge: 'bg-gray-100 text-gray-700',
    badgeOutline: 'border-gray-300 text-gray-700',
    button: 'bg-gray-600 text-white hover:bg-gray-700 shadow-sm',
    buttonOutline: 'border-gray-600 text-gray-600 hover:bg-gray-50',
    buttonGhost: 'text-gray-600 hover:bg-gray-50',
    progress: 'bg-gray-500',
    text600: 'text-gray-600',
    bg50: 'bg-gray-50',
    border200: 'border-gray-200',
    border300: 'border-gray-300',
    border400: 'border-gray-400',
    border500: 'border-gray-500',
  },
};

export function getColorClasses(scheme: string): ColorClasses {
  return colorMap[scheme as ColorScheme] ?? colorMap.gray;
}
