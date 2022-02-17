const content = ["./lib/**/*.{vue,js,ts}"];

if ("prod" !== process.env.NODE_ENV) {
  content.push("./src/**/*.{vue,ts}");
}

/** @type import("tailwindcss/tailwind-config").TailwindConfig */
module.exports = {
  corePlugins: {
    accessibility: false,
    backgroundClip: false,
    clear: false,
    float: false,
    preflight: false,
  },
  content,
  theme: {
    extend: {},
  },
  plugins: [],
  prefix: "vp-",
};
