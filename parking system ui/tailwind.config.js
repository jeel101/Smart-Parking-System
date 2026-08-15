/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class", // toggle by adding/removing `dark` class on <html>
    content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                // Brand palette (from your reference swatches)
                ink: "#0F3040",     // deep teal — headers, dark-mode surface, primary text
                slate: "#464858",   // muted navy — secondary text, borders, dark-mode cards
                clay: "#A56F63",    // warm terracotta — primary actions, active states
                sand: "#D99B7F",    // soft peach — hover/highlight, secondary accents

                // Light-mode neutrals derived from the palette (warm, not stark white)
                base: "#FBF6F2",
                light: "#FFFFFF",
                dark: "#0F3040",

                // Legacy aliases kept so existing className references don't break
                primary: "#A56F63",
                accent: "#D99B7F",

                // Slot status — unchanged per requirement, kept as named tokens
                "status-available": "#08CB00",
                "status-reserved": "#FFD700",
                "status-occupied": "#FF3737",
            },
            fontFamily: {
                display: ["'Sora'", "sans-serif"],   // signage-style headings
                body: ["'Inter'", "sans-serif"],
                mono: ["'JetBrains Mono'", "monospace"], // slot numbers / ticket data
            },
            boxShadow: {
                card: "0 1px 2px rgba(15,48,64,0.06), 0 8px 24px rgba(15,48,64,0.08)",
                "card-dark": "0 1px 2px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.4)",
            },
            keyframes: {
                pulseDot: {
                    "0%, 100%": { opacity: 1, boxShadow: "0 0 0 0 rgba(8,203,0,0.5)" },
                    "50%": { opacity: 0.85, boxShadow: "0 0 0 6px rgba(8,203,0,0)" },
                },
            },
            animation: {
                pulseDot: "pulseDot 1.8s ease-in-out infinite",
            },
        },
    },
    plugins: [],
};
