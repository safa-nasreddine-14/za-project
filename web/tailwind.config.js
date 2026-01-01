/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'primary-blue': '#002347',
                'secondary-blue': '#003366',
                'alarm-red': '#D32F2F',
            }
        },
    },
    plugins: [],
}
