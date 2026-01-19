import next from "eslint-config-next";

const config = [
  {
    ignores: [
      "coverage/**",
      ".next/**",
      "node_modules/**",
      "eslint.config.js"
    ]
  },
  ...next
];

export default config;
