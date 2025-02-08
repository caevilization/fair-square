/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{html,js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                "dark-bg": "#222831",
                "dark-card": "rgba(57, 62, 70, 0.8)",
                "highlight-from": "#ffd369",
                "highlight-to": "#f93a3a",
            },
            fontFamily: {
                exo: ['"Exo 2"', "sans-serif"],
            },
            fontSize: {
                // Base text size
                base: ["1rem", "1.5rem"], // 16px
                lg: ["1.125rem", "1.75rem"], // 18px
                xl: ["1.25rem", "1.75rem"], // 20px
                "2xl": ["1.5rem", "2rem"], // 24px
                "3xl": ["1.875rem", "2.25rem"], // 30px
                "4xl": ["2.25rem", "2.5rem"], // 36px
                "5xl": ["3rem", "1"], // 48px
                "6xl": ["3.75rem", "1"], // 60px
                "7xl": ["4.5rem", "1"], // 72px
                "8xl": ["6rem", "1"], // 96px
                "9xl": ["8rem", "1"], // 128px
            },
        },
    },
    plugins: [],
    corePlugins: {
        preflight: true,
    },
};
