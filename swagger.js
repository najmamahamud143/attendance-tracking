const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const spec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: { title: "Attendify API", version: "2.0.0" },
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
  },
  apis: ["./src/routes/*.js"],
});

function mountSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(spec));
}

module.exports = { mountSwagger, spec };
