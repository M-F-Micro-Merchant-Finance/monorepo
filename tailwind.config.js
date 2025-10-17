export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				merchant: {
					primary: 'hsl(var(--merchant-primary))',
					'primary-light': 'hsl(var(--merchant-primary-light))',
					'primary-dark': 'hsl(var(--merchant-primary-dark))',
					secondary: 'hsl(var(--merchant-secondary))',
					accent: 'hsl(var(--merchant-accent))',
					warning: 'hsl(var(--merchant-warning))',
					success: 'hsl(var(--merchant-success))',
					surface: 'hsl(var(--merchant-surface))'
				},
				business: {
					primary: 'hsl(var(--business-primary))',
					secondary: 'hsl(var(--business-secondary))',
					surface: 'hsl(var(--business-surface))',
					success: 'hsl(var(--business-success))',
					warning: 'hsl(var(--business-warning))',
					accent: 'hsl(var(--business-accent))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'pulse-soft': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' }
				},
				'float-3d': {
					'0%, 100%': { 
						transform: 'translateY(0px) rotateX(0deg)' 
					},
					'50%': { 
						transform: 'translateY(-10px) rotateX(5deg)' 
					}
				},
				'logo-pulse': {
					'0%, 100%': { 
						filter: 'drop-shadow(0 0 20px hsl(142 76% 36% / 0.6))'
					},
					'50%': { 
						filter: 'drop-shadow(0 0 30px hsl(142 76% 36% / 0.9)) drop-shadow(0 0 50px hsl(142 100% 45% / 0.4))'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'pulse-soft': 'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'float-3d': 'float-3d 6s ease-in-out infinite',
				'logo-pulse': 'logo-pulse 4s ease-in-out infinite'
			},
			perspective: {
				'1000': '1000px',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
}
