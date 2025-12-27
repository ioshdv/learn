/**
 * Definición completa de Especificación OpenAPI 3.0.0
 */
const openapiConfig = {
  openapi: "3.0.0",
  info: {
    title: "API REST Versionada",
    version: "2.0.0",
    description: "Documentación técnica de la API con JWT, Webhooks y Content Negotiation"
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Servidor de Desarrollo"
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      Producto: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          nombre: { type: "string", example: "Teclado Mecánico" },
          precio: { type: "number", example: 85.50 },
          categoria: { type: "string", example: "Accesorios" },
          stock: { type: "integer", example: 20 }
        }
      }
    }
  },
  paths: {
    "/login": {
      post: {
        summary: "Obtener token JWT",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  username: { type: "string", example: "admin" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Token generado" }
        }
      }
    },
    "/api/v2/productos": {
      get: {
        summary: "Listar productos (V2)",
        responses: {
          200: {
            description: "Lista en JSON o XML",
            content: {
              "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Producto" } } },
              "application/xml": { schema: { type: "array", items: { $ref: "#/components/schemas/Producto" } } }
            }
          }
        }
      },
      post: {
        summary: "Crear producto (Protegido)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/Producto" } }
          }
        },
        responses: {
          201: { description: "Creado exitosamente" },
          401: { description: "No autorizado" }
        }
      }
    }
  }
};

module.exports = openapiConfig;