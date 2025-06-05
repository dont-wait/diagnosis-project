tailwind.config = {
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: '#1E40AF',
                secondary: '#38BDF8',
                dark: {
                    primary: '#1E3A8A',
                    secondary: '#0EA5E9',
                    bg: '#0F172A',
                    text: '#E2E8F0'
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif']
            },
            fontSize: {
                'xs': '0.75rem',
                'sm': '0.875rem',
                'base': '1rem',
                'lg': '1.125rem',
                'xl': '1.25rem',
                '2xl': '1.5rem',
                '3xl': '1.875rem',
                '4xl': '2.25rem',
                '5xl': '3rem',
                '6xl': '3.75rem'
            }
        }
    },
};

// Dark mode detection
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    document.documentElement.classList.add('light');
}
window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', event => {
    if (event.matches) {
        document.documentElement.classList.add('light');
    } else {
        document.documentElement.classList.remove('light');
    }
});
