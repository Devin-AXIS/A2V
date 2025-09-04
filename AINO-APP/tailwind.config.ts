import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 使用CSS变量，基于设计令牌
        background: "hsl(var(--background))",
        "background-secondary": "hsl(var(--background-secondary))",
        "background-tertiary": "hsl(var(--background-tertiary))",
        
        foreground: "hsl(var(--foreground))",
        "foreground-secondary": "hsl(var(--foreground-secondary))",
        "foreground-tertiary": "hsl(var(--foreground-tertiary))",
        "foreground-inverse": "hsl(var(--foreground-inverse))",
        
        primary: {
          50: "hsl(var(--primary-50))",
          100: "hsl(var(--primary-100))",
          200: "hsl(var(--primary-200))",
          300: "hsl(var(--primary-300))",
          400: "hsl(var(--primary-400))",
          500: "hsl(var(--primary-500))",
          600: "hsl(var(--primary-600))",
          700: "hsl(var(--primary-700))",
          800: "hsl(var(--primary-800))",
          900: "hsl(var(--primary-900))",
          DEFAULT: "hsl(var(--primary-500))",
          foreground: "hsl(var(--primary-foreground))",
        },
        
        secondary: {
          50: "hsl(var(--secondary-50))",
          100: "hsl(var(--secondary-100))",
          200: "hsl(var(--secondary-200))",
          300: "hsl(var(--secondary-300))",
          400: "hsl(var(--secondary-400))",
          500: "hsl(var(--secondary-500))",
          600: "hsl(var(--secondary-600))",
          700: "hsl(var(--secondary-700))",
          800: "hsl(var(--secondary-800))",
          900: "hsl(var(--secondary-900))",
          DEFAULT: "hsl(var(--secondary-500))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        
        neutral: {
          50: "hsl(var(--neutral-50))",
          100: "hsl(var(--neutral-100))",
          200: "hsl(var(--neutral-200))",
          300: "hsl(var(--neutral-300))",
          400: "hsl(var(--neutral-400))",
          500: "hsl(var(--neutral-500))",
          600: "hsl(var(--neutral-600))",
          700: "hsl(var(--neutral-700))",
          800: "hsl(var(--neutral-800))",
          900: "hsl(var(--neutral-900))",
        },
        
        success: {
          50: "hsl(var(--success-50))",
          100: "hsl(var(--success-100))",
          200: "hsl(var(--success-200))",
          300: "hsl(var(--success-300))",
          400: "hsl(var(--success-400))",
          500: "hsl(var(--success-500))",
          600: "hsl(var(--success-600))",
          700: "hsl(var(--success-700))",
          800: "hsl(var(--success-800))",
          900: "hsl(var(--success-900))",
          DEFAULT: "hsl(var(--success-500))",
        },
        
        warning: {
          50: "hsl(var(--warning-50))",
          100: "hsl(var(--warning-100))",
          200: "hsl(var(--warning-200))",
          300: "hsl(var(--warning-300))",
          400: "hsl(var(--warning-400))",
          500: "hsl(var(--warning-500))",
          600: "hsl(var(--warning-600))",
          700: "hsl(var(--warning-700))",
          800: "hsl(var(--warning-800))",
          900: "hsl(var(--warning-900))",
          DEFAULT: "hsl(var(--warning-500))",
        },
        
        error: {
          50: "hsl(var(--error-50))",
          100: "hsl(var(--error-100))",
          200: "hsl(var(--error-200))",
          300: "hsl(var(--error-300))",
          400: "hsl(var(--error-400))",
          500: "hsl(var(--error-500))",
          600: "hsl(var(--error-600))",
          700: "hsl(var(--error-700))",
          800: "hsl(var(--error-800))",
          900: "hsl(var(--error-900))",
          DEFAULT: "hsl(var(--error-500))",
        },
        
        info: {
          50: "hsl(var(--info-50))",
          100: "hsl(var(--info-100))",
          200: "hsl(var(--info-200))",
          300: "hsl(var(--info-300))",
          400: "hsl(var(--info-400))",
          500: "hsl(var(--info-500))",
          600: "hsl(var(--info-600))",
          700: "hsl(var(--info-700))",
          800: "hsl(var(--info-800))",
          900: "hsl(var(--info-900))",
          DEFAULT: "hsl(var(--info-500))",
        },
        
        // 功能颜色
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        popover: "hsl(var(--popover))",
        "popover-foreground": "hsl(var(--popover-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        destructive: "hsl(var(--destructive))",
        "destructive-foreground": "hsl(var(--destructive-foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        "input-foreground": "hsl(var(--input-foreground))",
        ring: "hsl(var(--ring))",
      },
      
      // 字体系统 - 基于设计令牌
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
        serif: ["Georgia", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "'SF Mono'", "Consolas", "'Liberation Mono'", "Menlo", "monospace"],
      },
      
      // 字体大小 - 基于设计令牌
      fontSize: {
        xs: "var(--font-size-xs)",
        sm: "var(--font-size-sm)",
        base: "var(--font-size-base)",
        lg: "var(--font-size-lg)",
        xl: "var(--font-size-xl)",
        "2xl": "var(--font-size-2xl)",
        "3xl": "var(--font-size-3xl)",
        "4xl": "var(--font-size-4xl)",
        "5xl": "var(--font-size-5xl)",
        "6xl": "var(--font-size-6xl)",
        "7xl": "var(--font-size-7xl)",
        "8xl": "var(--font-size-8xl)",
        "9xl": "var(--font-size-9xl)",
      },
      
      // 间距系统 - 基于设计令牌
      spacing: {
        xs: "var(--spacing-xs, 0.25rem)",
        sm: "var(--spacing-sm, 0.5rem)",
        md: "var(--spacing-md, 1rem)",
        lg: "var(--spacing-lg, 1.5rem)",
        xl: "var(--spacing-xl, 2rem)",
        "2xl": "var(--spacing-2xl, 3rem)",
        "3xl": "var(--spacing-3xl, 4rem)",
      },
      
      // 圆角系统 - 基于设计令牌
      borderRadius: {
        none: "var(--radius-none, 0)",
        sm: "var(--radius-sm, 0.125rem)",
        md: "var(--radius-md, 0.375rem)",
        lg: "var(--radius-lg, 0.5rem)",
        xl: "var(--radius-xl, 0.75rem)",
        full: "var(--radius-full, 9999px)",
      },
      
      // 阴影系统 - 基于设计令牌
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        inner: "var(--shadow-inner)",
      },
    },
  },
  plugins: [],
}

export default config
