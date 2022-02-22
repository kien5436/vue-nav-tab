const content = ["./lib/**/*.{vue,js,ts}"];

if ("prod" !== process.env.NODE_ENV) {
  content.push("./src/**/*.{vue,ts}");
}

/** @type import("tailwindcss/tailwind-config").TailwindConfig */
module.exports = {
  content,
  corePlugins: {
    accessibility: false,
    backgroundClip: false,
    clear: false,
    float: false,
    preflight: false,
  },
  plugins: [],
  prefix: "vp-",
  theme: { extend: {} },
};