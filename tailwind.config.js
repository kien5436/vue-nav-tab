/** @type import("tailwindcss/tailwind-config").TailwindConfig */
module.exports = {
  corePlugins: {
    accessibility: false,
    backgroundClip: false,
    clear: false,
    float: false,
    preflight: false,
  },
  content: ["./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
  prefix: "vp-",
};
