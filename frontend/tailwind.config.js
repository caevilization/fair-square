/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
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
        },
    },
    plugins: [],
    corePlugins: {
        preflight: true,
    },
};
