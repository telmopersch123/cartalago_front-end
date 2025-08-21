const fs = require("fs");
const path = require("path");

const envFile = path.join(__dirname, "src/environments/environment.prod.ts");

// Pega a variável da Vercel
const apiUrl = process.env.API_URL || "http://localhost:3000/api";

const content = `export const environment = {
  production: true,
  API_URL: '${apiUrl}'
};
`;

fs.writeFileSync(envFile, content, { encoding: "utf8" });
console.log("environment.prod.ts atualizado com API_URL:", apiUrl);
