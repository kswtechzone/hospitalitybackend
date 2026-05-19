"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: [
            'http://localhost:3000',
            'https://kswtechzone.com.np',
            'https://ms.kswtechzone.com.np',
            'https://kswtechzone.com',
            /\.kswtechzone\.com\.np$/,
            /\.kswtechzone\.com$/
        ],
        credentials: true,
    });
    await app.listen(process.env.PORT ?? 4000);
    console.log(`Backend is running on: ${await app.getUrl()}`);
}
bootstrap();
//# sourceMappingURL=main.js.map