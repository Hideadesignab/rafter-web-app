/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#FFFFFF',
      black: '#000000',
      gray: {
        50: '#FAFAFA',
        100: '#F5F5F5',
        200: '#E5E5E5',
        300: '#D4D4D4',
        400: '#A3A3A3',
        500: '#737373',
        600: '#525252',
        700: '#404040',
        800: '#262626',
        900: '#171717',
      },
      blue: {
        500: '#3B82F6',
        600: '#2563EB',
      },
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
    },
    extend: {
      // Typography scale - bigger jumps for better hierarchy
      fontSize: {
        'xs': ['11px', { lineHeight: '1.4' }],
        'sm': ['13px', { lineHeight: '1.5' }],
        'base': ['15px', { lineHeight: '1.6' }],
        'lg': ['17px', { lineHeight: '1.5' }],
        'xl': ['20px', { lineHeight: '1.4' }],
        '2xl': ['24px', { lineHeight: '1.3' }],
        '3xl': ['30px', { lineHeight: '1.2' }],
      },
      // Custom easing functions for consistent micro-interactions
      transitionTimingFunction: {
        'ease-enter': 'cubic-bezier(0, 0, 0.2, 1)',      // ease-out for entering elements
        'ease-exit': 'cubic-bezier(0.4, 0, 1, 1)',       // ease-in for exiting elements
        'ease-move': 'cubic-bezier(0.4, 0, 0.2, 1)',     // ease-in-out for movement
        'ease-bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)', // bounce for playful interactions
      },
      animation: {
        // Existing animations
        fadeIn: 'fadeIn 0.2s ease-out',
        slideIn: 'slideIn 0.2s ease-out',
        slideOut: 'slideOut 0.2s ease-in',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        blink: 'blink 0.75s step-end infinite',
        fadeOut: 'fadeOut 200ms ease-out forwards',
        // New micro-interaction animations
        'message-user': 'slideFromRight 0.3s cubic-bezier(0, 0, 0.2, 1) both',
        'message-ai': 'slideFromLeft 0.3s cubic-bezier(0, 0, 0.2, 1) both',
        'panel-enter': 'panelSlideIn 0.25s cubic-bezier(0, 0, 0.2, 1)',
        'panel-exit': 'panelSlideOut 0.2s cubic-bezier(0.4, 0, 1, 1)',
        'panel-content': 'panelContentFade 0.15s cubic-bezier(0, 0, 0.2, 1) 0.15s both',
        'sidebar-item': 'sidebarItemEnter 0.2s cubic-bezier(0, 0, 0.2, 1) both',
        'scroll-button': 'scrollButtonFade 0.2s cubic-bezier(0, 0, 0.2, 1)',
      },
      keyframes: {
        // Existing keyframes
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        fadeOut: {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        // New micro-interaction keyframes
        slideFromRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideFromLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        panelSlideIn: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        panelSlideOut: {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(100%)' },
        },
        panelContentFade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        sidebarItemEnter: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scrollButtonFade: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
