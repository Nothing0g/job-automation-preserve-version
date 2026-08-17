import { mkdir, writeFile } from "node:fs/promises";
import { createDocxBlob, createPdfArrayBuffer } from "../client/src/lib/documentExport.ts";

const outputDirectory = "/home/ubuntu/export-qa";
const input = {
  company: "Northstar Analytics",
  role: "Data Analyst",
  kind: "resume",
  fileStem: "northstar-data-analyst",
  content: "# Professional Summary\nFactual analyst experienced in SQL reporting and stakeholder communication.\n## Selected Experience\n- Built a weekly reporting workflow using SQL.\n- Partnered with stakeholders to clarify metric definitions.\n## Education\nBachelor of Science in Statistics",
};

await mkdir(outputDirectory, { recursive: true });
const docx = await createDocxBlob(input);
const pdf = createPdfArrayBuffer(input);
await writeFile(`${outputDirectory}/northstar-data-analyst-tailored-resume.docx`, new Uint8Array(await docx.arrayBuffer()));
await writeFile(`${outputDirectory}/northstar-data-analyst-tailored-resume.pdf`, new Uint8Array(pdf));
console.log(outputDirectory);
