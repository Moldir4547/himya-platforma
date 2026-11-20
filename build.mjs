import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
const files = [
  "index.html",
  "chembridge-home-720.jpg",
  "chembridge-home-1440.jpg",
  "appearance.js",
  "appearance.css",
  "virtual-lab.html",
  "404.html",
  ".nojekyll",
  "app.js",
  "store.js",
  "data.js",
  "config.js",
  "catalog.js",
  "platform-utils.js",
  "learning.js",
  "teacher-journey.js",
  "bridge-book.js",
  "bridge-evidence.js",
  "bridge-diagnostic.js",
  "bridge-diagnostic-data.js",
  "continuity-assessment.js",
  "teacher-journey.css",
  "university-control.js",
  "university-labs.js",
  "university-lab-co2.html",
  "university-lab-metal.html",
  "university-lab-classes.html",
  "university-lab-kinetics.html",
  "university-lab-solutions.html",
  "university-lab-solutions-full.html",
  "university-lab-hydrolysis.html",
  "university-lab-redox.html",
  "university-lab-complexes.html",
  "university-control-data.js",
  "registration.js",
  "bond-practice.js",
  "bridge-path.js",
  "bridge-exit.js",
  "bond-models.js",
  "bond-lab.js",
  "equivalent-path.js",
  "school.js",
  "worksheet-quests.js",
  "worksheet-delivery.js",
  "school-explanations.js",
  "school-equation-practice.js",
  "school-visuals.js",
  "school-materials.js",
  "teacher-materials.js",
  "teacher-materials.css",
  "guided-lab.js",
  "guided-lab-data.js",
  "guided-lab-11-data.js",
  "guided-lab-11-scene.js",
  "guided-lab-10-data.js",
  "guided-lab-10-scene.js",
  "guided-lab-9-data.js",
  "guided-lab-9-scene.js",
  "guided-lab-8-data.js",
  "guided-lab-8-scene.js",
  "guided-lab-model.js",
  "guided-lab.css",
  "school-labs.js",
  "school-curriculum.js",
  "school.css",
  "bond-models.css",
  "bridge-path.css",
  "bond-practice.css",
  "learning-api.js",
  "redox-data.js",
  "styles.css",
  "components.css",
  "accessibility.css",
  "learning.css",
  "platform.css",
  "experience.css",
];
// Fail deployment before publishing a broken module graph.
for (const file of files.filter(name => name.endsWith(".js"))) {
  const source = await readFile(file, "utf8");
  for (const match of source.matchAll(/(?:from\s*|import\s*\(\s*|import\s*)(["'])(\.\/[a-zA-Z0-9_.-]+\.js)\1/g)) {
    if (!files.includes(match[2].slice(2)))
      throw new Error(file + " imports unpublished asset " + match[2]);
  }
}
await mkdir("dist", { recursive: true });
const revision = process.env.GITHUB_SHA || "preview";
for (const file of files) {
  if (file.endsWith(".jpg")) {
    await copyFile(file, `dist/${file}`);
    continue;
  }
  let text = await readFile(file, "utf8");
  if (file.endsWith(".js"))
    text = text.replace(
      /(["'])(\.\/[a-zA-Z0-9_.-]+\.js)\1/g,
      (_, q, p) => `${q}${p}?v=${revision}${q}`,
    );
  if (file === "index.html")
    text = text.replace(
      /((?:src|href)=["'])([a-zA-Z0-9_.-]+\.(?:js|css))(["'])/g,
      (_, a, p, q) => `${a}${p}?v=${revision}${q}`,
    );
  if (
    file === "config.js" &&
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_ANON_KEY
  ) {
    if (!process.env.SUPABASE_ANON_KEY.startsWith("sb_publishable_"))
      throw new Error("Use a publishable key, never a service-role/secret key");
    text = `window.__CHEM_CONFIG__=${JSON.stringify({ schemaVersion: 2, supabaseUrl: process.env.SUPABASE_URL, supabaseAnonKey: process.env.SUPABASE_ANON_KEY })};`;
  }
  await writeFile(`dist/${file}`, text);
}
console.log(`Built ${files.length} public assets in dist/`);

