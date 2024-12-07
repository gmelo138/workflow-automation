import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export class SwaggerConfig {
  setup(app: INestApplication): void {
    const isProduction = process.env.NODE_ENV === 'production';

    if (!isProduction) {
      const config = new DocumentBuilder()
        .setTitle('Workflow Automation API')
        .setDescription('API documentation for Workflow Automation system')
        .setVersion('1.0')
        .addTag('Workflow')
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('docs', app, document, {
        customSiteTitle: 'Workflow API Docs',
      });
    }
  }
}
