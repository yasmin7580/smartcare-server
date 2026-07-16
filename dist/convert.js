"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const file = fs.readFileSync("./firebaseServiceKey.json", "utf-8");
const base64 = Buffer.from(file).toString("base64");
console.log(base64);
//# sourceMappingURL=convert.js.map