"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
function loadEnvFile() {
    const envPath = (0, node_path_1.resolve)(process.cwd(), ".env");
    if (!(0, node_fs_1.existsSync)(envPath)) {
        return;
    }
    const lines = (0, node_fs_1.readFileSync)(envPath, "utf8").split(/\r?\n/);
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith("#")) {
            continue;
        }
        const separatorIndex = trimmedLine.indexOf("=");
        if (separatorIndex === -1) {
            continue;
        }
        const key = trimmedLine.slice(0, separatorIndex).trim();
        const value = trimmedLine.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) {
            process.env[key] = value;
        }
    }
}
function requiredEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}
loadEnvFile();
exports.env = {
    port: Number(process.env.PORT ?? 8000),
    mongodbUri: requiredEnv("MONGODB_URI"),
    mongodbDatabase: process.env.MONGODB_DATABASE ?? "smartcare",
};
//# sourceMappingURL=env.js.map