"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
function createApp() {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.get("/", (_req, res) => {
        res.send("Hello");
    });
    app.get("/health", (_req, res) => {
        res.json({
            status: "ok",
            service: "smartcare-backend",
        });
    });
    return app;
}
//# sourceMappingURL=app.js.map