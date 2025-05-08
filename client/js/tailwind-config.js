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
            }
        }
    }
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
