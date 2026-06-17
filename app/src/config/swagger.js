import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "API de Tarefas",
      version: "1.0.0",
      description: "Documentação da API de Tarefas do curso Programador Web"
    },

    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor local"
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
        Erro: {
          type: "object",
          properties: {
            erro: {
              type: "string",
              example: "Mensagem de erro."
            }
          }
        },

        Usuario: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "665f1c2a9b1e8c0012345678"
            },
            nome: {
              type: "string",
              example: "João da Silva"
            },
            email: {
              type: "string",
              format: "email",
              example: "joao@email.com"
            }
          }
        },

        NovoUsuario: {
          type: "object",
          required: ["nome", "email", "senha"],
          properties: {
            nome: {
              type: "string",
              example: "João da Silva"
            },
            email: {
              type: "string",
              format: "email",
              example: "joao@email.com"
            },
            senha: {
              type: "string",
              format: "password",
              example: "senha123"
            }
          }
        },

        Login: {
          type: "object",
          required: ["email", "senha"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "joao@email.com"
            },
            senha: {
              type: "string",
              format: "password",
              example: "senha123"
            }
          }
        },

        LoginResponse: {
          type: "object",
          properties: {
            token: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            }
          }
        },

        Mensagem: {
          type: "object",
          properties: {
            mensagem: {
              type: "string",
              example: "Operação realizada com sucesso."
            }
          }
        },

        NovaTarefa: {
          type: "object",
          required: ["titulo", "prioridade"],
          properties: {
            titulo: {
              type: "string",
              minLength: 3,
              maxLength: 50,
              example: "Estudar Swagger"
            },
            prioridade: {
              type: "string",
              enum: ["Baixa", "Média", "Alta"],
              example: "Alta"
            }
          }
        },

        AtualizarTarefa: {
          type: "object",
          properties: {
            titulo: {
              type: "string",
              minLength: 3,
              maxLength: 50,
              example: "Estudar Jest"
            },
            concluida: {
              type: "boolean",
              example: true
            },
            prioridade: {
              type: "string",
              enum: ["Baixa", "Média", "Alta"],
              example: "Média"
            }
          }
        },

        Tarefa: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "665f1c2a9b1e8c0012345678"
            },
            titulo: {
              type: "string",
              example: "Estudar Swagger"
            },
            concluida: {
              type: "boolean",
              example: false
            },
            prioridade: {
              type: "string",
              enum: ["Baixa", "Média", "Alta"],
              example: "Alta"
            },
            usuario: {
              oneOf: [
                {
                  type: "string",
                  example: "665f1c2a9b1e8c0098765432"
                },
                {
                  $ref: "#/components/schemas/Usuario"
                }
              ]
            },
            anexo: {
              type: "string",
              example: "uploads/arquivo.pdf"
            },
            anexos: {
              type: "array",
              items: {
                type: "string"
              },
              example: [
                "uploads/arquivo1.pdf",
                "uploads/arquivo2.pdf"
              ]
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2026-06-10T14:30:00.000Z"
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2026-06-10T14:35:00.000Z"
            }
          }
        },

        Comentario: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "665f1c2a9b1e8c0012345678"
            },
            texto: {
              type: "string",
              example: "Este é um comentário."
            },
            autor: {
              type: "string",
              example: "Maria"
            },
            tarefa: {
              type: "string",
              example: "665f1c2a9b1e8c0098765432"
            },
            comentarioPai: {
              type: "string",
              nullable: true,
              example: null
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2026-06-10T14:30:00.000Z"
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2026-06-10T14:35:00.000Z"
            }
          }
        },

        NovoComentario: {
          type: "object",
          required: ["texto", "autor", "tarefa"],
          properties: {
            texto: {
              type: "string",
              example: "Este é um comentário."
            },
            autor: {
              type: "string",
              example: "Maria"
            },
            tarefa: {
              type: "string",
              example: "665f1c2a9b1e8c0098765432"
            },
            comentarioPai: {
              type: "string",
              nullable: true,
              example: null
            }
          }
        },

        UploadAnexoResponse: {
          type: "object",
          properties: {
            mensagem: {
              type: "string",
              example: "Anexo enviado com sucesso!"
            },
            anexo: {
              type: "object",
              properties: {
                fieldname: {
                  type: "string",
                  example: "anexo"
                },
                originalname: {
                  type: "string",
                  example: "arquivo.pdf"
                },
                encoding: {
                  type: "string",
                  example: "7bit"
                },
                mimetype: {
                  type: "string",
                  example: "application/pdf"
                },
                destination: {
                  type: "string",
                  example: "uploads/"
                },
                filename: {
                  type: "string",
                  example: "abc123-arquivo.pdf"
                },
                path: {
                  type: "string",
                  example: "uploads/abc123-arquivo.pdf"
                },
                size: {
                  type: "number",
                  example: 12345
                }
              }
            }
          }
        },

        UploadAnexosResponse: {
          type: "object",
          properties: {
            mensagem: {
              type: "string",
              example: "Anexos enviados com sucesso!"
            },
            anexos: {
              type: "array",
              items: {
                type: "object"
              }
            }
          }
        }
      }
    }
  },

  apis: ["./src/routes/*.js"]
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);

export default swaggerSpecs;