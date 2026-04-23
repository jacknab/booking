import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";

const browserGlobalCollisions = [
  { name: "Lock", message: "Use `Lock` from 'lucide-react' (this is the Web Locks API global). Add it to your import." },
  { name: "Notification", message: "Use `Notification` from 'lucide-react' (this is the Web Notifications API global). Add it to your import." },
  { name: "Request", message: "Use `Request` from 'lucide-react' (this is the Fetch API global). Add it to your import." },
  { name: "Response", message: "Use `Response` from 'lucide-react' (this is the Fetch API global). Add it to your import." },
  { name: "Image", message: "Use `Image` from 'lucide-react' (this is the HTMLImageElement global). Add it to your import." },
  { name: "Option", message: "Use `Option` from 'lucide-react' (this is the HTMLOptionElement global). Add it to your import." },
  { name: "Range", message: "Use `Range` from 'lucide-react' (this is the DOM Range global). Add it to your import." },
  { name: "Selection", message: "Use `Selection` from 'lucide-react' (this is the DOM Selection global). Add it to your import." },
  { name: "Text", message: "Use `Text` from 'lucide-react' (this is the DOM Text node global). Add it to your import." },
  { name: "Headers", message: "Use `Headers` from 'lucide-react' (this is the Fetch API global). Add it to your import." },
  { name: "Touch", message: "Use `Touch` from 'lucide-react' (this is the TouchEvent global). Add it to your import." },
  { name: "Gamepad", message: "Use `Gamepad` from 'lucide-react' (this is the Gamepad API global). Add it to your import." },
  { name: "FileReader", message: "Use `FileReader` from 'lucide-react' (this is the FileReader API global). Add it to your import." },
];

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", "migrations/**", "scripts/**", "script/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["client/src/**/*.{ts,tsx}"],
    plugins: { react },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: "detect" } },
    rules: {
      "no-restricted-globals": ["error", ...browserGlobalCollisions],
      "react/jsx-no-undef": "error",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "no-empty": "off",
      "no-useless-escape": "off",
      "no-prototype-builtins": "off",
      "no-control-regex": "off",
      "no-cond-assign": "off",
      "no-misleading-character-class": "off",
      "no-fallthrough": "off",
      "no-async-promise-executor": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
);
