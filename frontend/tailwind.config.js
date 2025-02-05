/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        screens: {
            sm: "640px",
            md: "768px",
            lg: "1024px",
            xl: "1280px",
            "2xl": "1536px",
        },
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
                // 使用 clamp 来限制字体大小的范围
                base: ["clamp(1rem, 1vw, 1.2rem)", "1.5"],
                lg: ["clamp(1.125rem, 1.2vw, 1.35rem)", "1.75"],
                xl: ["clamp(1.25rem, 1.4vw, 1.5rem)", "1.75"],
                "2xl": ["clamp(1.5rem, 1.6vw, 1.8rem)", "2"],
                "3xl": ["clamp(1.875rem, 2vw, 2.25rem)", "2.25"],
                "4xl": ["clamp(2.25rem, 2.4vw, 2.7rem)", "2.5"],
                "5xl": ["clamp(3rem, 3.2vw, 3.6rem)", "1"],
                "6xl": ["clamp(3.75rem, 4vw, 4.5rem)", "1"],
                "7xl": ["clamp(4.5rem, 4.8vw, 5.4rem)", "1"],
                "8xl": ["clamp(6rem, 6.4vw, 7.2rem)", "1"],
                "9xl": ["clamp(8rem, 8.5vw, 9.6rem)", "1"],
            },
        },
    },
    plugins: [],
    corePlugins: {
        preflight: true,
    },
};
