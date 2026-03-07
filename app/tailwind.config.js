/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./app/**/*.{js,jsx,ts,tsx}",
		"./components/**/*.{js,jsx,ts,tsx}",
		"./feature/**/*.{js,jsx,ts,tsx}",
	],
	presets: [require("nativewind/preset")],
	theme: {
		extend: {
			colors: {
				white: "#FFFFFF",
				black: "#0D1011",
				gray25: "#F9FAFB",
				gray50: "#F0F3F4",
				gray100: "#f0f0f0",
				gray200: "#e5e5e5",
				gray300: "#d4d4d4",
				gray400: "#a3a3a3",
				gray500: "#737373",
				gray600: "#525252",
				gray700: "#404040",
				gray800: "#1D1818FF",
				gray900: "#171717",
				gray950: "#0a0a0a",

				red50: "#FCE8EC",
				red100: "#FFE9E9",
				red200: "#F28D9E",
				red300: "#ED5E76",
				red400: "#E8314F",
				red500: "#E01C48",
				red600: "#b00000",
				red700: "#5C0A18",
				red800: "#450812",
				red900: "#2E050C",

				yellow100: "#FDF6E9",
				yellow400: "#E8A830",
				yellow500: "#E8A830",

				blue100: "#E9F5FF",
				blue400: "#007AFF",

				orange100: "#FFEEDC",
				orange400: "#FF9500",

				purple100: "#F5F0FF",
				purple400: "#8053D2",

				green100: "#E9FFE9",
				green400: "#30E84F",

				brown100: "#F5F0E9",
				brown400: "#AA7614FF",

				sky100: "#E9F5FF",
				sky400: "#007AFF",
			},
		},
	},
	plugins: [],
};
