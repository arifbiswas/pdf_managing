import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/pdfjs-dist/cmaps/",
          dest: "cmaps",
        },
        // যদি দরকার হয়: wasm, standard_fonts ইত্যাদি
      ],
    }),
  ],
});
