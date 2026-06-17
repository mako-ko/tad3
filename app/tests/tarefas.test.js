import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

/*
 * IMPORTANTE:
 * Estas variáveis precisam ser definidas antes da importação do app.
 * O arquivo src/index.js conecta ao MongoDB quando é carregado.
 */
process.env.NODE_ENV = "test";
process.env.MONGODB_URI = "mongodb://localhost:27017/curso_test";

const { default: app } = await import("../src/index.js");
const { default: Usuario } = await import("../src/models/Usuario.js");
const { default: Tarefa } = await import("../src/models/Tarefa.js");
const { default: Comentario } = await import("../src/models/Comentario.js");

describe("Testes das Rotas de Tarefas", () => {
  let token;
  let usuarioId;
  let tarefaId;

  beforeAll(async () => {
    /*
     * Aguarda a conexão iniciada pelo src/index.js.
     */
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connection.asPromise();
    }

    /*
     * O src/index.js já executou dotenv.config().
     * Se o .env não tiver JWT_SECRET, usamos um valor de teste.
     */
    process.env.JWT_SECRET =
      process.env.JWT_SECRET || "chave_secreta_teste";

    /*
     * Limpa apenas o banco de teste.
     * Comentario é limpo antes de Tarefa porque referencia Tarefa.
     */
    await Comentario.deleteMany({});
    await Tarefa.deleteMany({});
    await Usuario.deleteMany({});

    /*
     * Cria um usuário de teste.
     * A senha será criptografada pelo hook pre("save") do model Usuario.
     */
    const usuario = new Usuario({
      nome: "Usuario Teste",
      email: "teste@teste.com",
      senha: "senha123"
    });

    await usuario.save();
    usuarioId = usuario._id;

    /*
     * Gera um token JWT compatível com o authMiddleware.
     * As rotas de tarefas usam req.usuarioId para associar a tarefa ao usuário.
     */
    token = jwt.sign(
      { id: usuarioId },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  });

  afterAll(async () => {
    /*
     * Limpa novamente o banco de teste ao final.
     */
    await Comentario.deleteMany({});
    await Tarefa.deleteMany({});
    await Usuario.deleteMany({});

    /*
     * Fecha a conexão para o Jest encerrar corretamente.
     */
    await mongoose.connection.close();
  });

  it("Deve retornar uma lista vazia de tarefas do usuário autenticado", async () => {
    const res = await request(app)
      .get("/tarefas")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(0);
  });

  it("Deve criar uma nova tarefa para o usuário autenticado", async () => {
    const res = await request(app)
      .post("/tarefas")
      .set("Authorization", `Bearer ${token}`)
      .send({
        titulo: "Tarefa de Teste",
        prioridade: "Alta"
      });

    expect(res.statusCode).toBe(201);

    expect(res.body).toHaveProperty("_id");
    expect(res.body.titulo).toBe("Tarefa de Teste");
    expect(res.body.prioridade).toBe("Alta");
    expect(res.body.concluida).toBe(false);

    /*
     * O campo usuario é obrigatório no model Tarefa.
     * A rota deve preenchê-lo com req.usuarioId.
     */
    expect(res.body.usuario).toBeDefined();
    expect(String(res.body.usuario)).toBe(String(usuarioId));

    /*
     * Campos opcionais do model.
     * Como não houve upload, anexo pode estar ausente.
     * O array anexos pode vir ausente ou vazio, dependendo da serialização.
     */
    if (res.body.anexos !== undefined) {
      expect(Array.isArray(res.body.anexos)).toBe(true);
      expect(res.body.anexos).toHaveLength(0);
    }

    tarefaId = res.body._id;
  });

  it("Deve listar a tarefa criada para o usuário autenticado", async () => {
    const res = await request(app)
      .get("/tarefas")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);

    expect(res.body[0]._id).toBe(tarefaId);
    expect(res.body[0].titulo).toBe("Tarefa de Teste");
    expect(res.body[0].prioridade).toBe("Alta");
    expect(res.body[0].concluida).toBe(false);

    /*
     * A rota GET /tarefas usa populate("usuario").
     * Portanto, o usuário deve vir como objeto populado.
     */
    expect(res.body[0].usuario).toBeDefined();
    expect(res.body[0].usuario._id).toBe(String(usuarioId));
    expect(res.body[0].usuario.nome).toBe("Usuario Teste");
    expect(res.body[0].usuario.email).toBe("teste@teste.com");

    /*
     * O model Usuario define senha com select:false.
     * Mesmo populado, o campo senha não deve ser retornado.
     */
    expect(res.body[0].usuario.senha).toBeUndefined();
  });

  it("Deve buscar a tarefa criada por ID", async () => {
    const res = await request(app)
      .get(`/tarefas/${tarefaId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);

    expect(res.body._id).toBe(tarefaId);
    expect(res.body.titulo).toBe("Tarefa de Teste");
    expect(res.body.prioridade).toBe("Alta");
    expect(res.body.concluida).toBe(false);

    /*
     * A rota GET /tarefas/:id também usa populate("usuario").
     */
    expect(res.body.usuario).toBeDefined();
    expect(res.body.usuario._id).toBe(String(usuarioId));
    expect(res.body.usuario.nome).toBe("Usuario Teste");
    expect(res.body.usuario.email).toBe("teste@teste.com");
    expect(res.body.usuario.senha).toBeUndefined();
  });

  it("Deve atualizar a tarefa criada", async () => {
    const res = await request(app)
      .put(`/tarefas/${tarefaId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        concluida: true,
        prioridade: "Média"
      });

    expect(res.statusCode).toBe(200);

    expect(res.body._id).toBe(tarefaId);
    expect(res.body.titulo).toBe("Tarefa de Teste");
    expect(res.body.prioridade).toBe("Média");
    expect(res.body.concluida).toBe(true);
  });

  it("Deve rejeitar criação de tarefa sem prioridade", async () => {
    const res = await request(app)
      .post("/tarefas")
      .set("Authorization", `Bearer ${token}`)
      .send({
        titulo: "Outra Tarefa"
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("erro");
  });

  it("Deve rejeitar criação de tarefa com prioridade inválida", async () => {
    const res = await request(app)
      .post("/tarefas")
      .set("Authorization", `Bearer ${token}`)
      .send({
        titulo: "Tarefa Inválida",
        prioridade: "Urgente"
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("erro");
  });

  it("Deve rejeitar criação de tarefa com título muito curto", async () => {
    const res = await request(app)
      .post("/tarefas")
      .set("Authorization", `Bearer ${token}`)
      .send({
        titulo: "AB",
        prioridade: "Baixa"
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("erro");
  });

  it("Deve retornar 404 ao buscar uma tarefa inexistente", async () => {
    const idInexistente = new mongoose.Types.ObjectId();

    const res = await request(app)
      .get(`/tarefas/${idInexistente}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.erro).toBe("Tarefa não encontrada.");
  });

  it("Deve retornar 404 ao atualizar uma tarefa inexistente", async () => {
    const idInexistente = new mongoose.Types.ObjectId();

    const res = await request(app)
      .put(`/tarefas/${idInexistente}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        concluida: true
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.erro).toBe("Tarefa não encontrada.");
  });

  it("Deve deletar a tarefa criada", async () => {
    const res = await request(app)
      .delete(`/tarefas/${tarefaId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(204);
    expect(res.body).toEqual({});
  });

  it("Deve retornar 404 ao deletar novamente a mesma tarefa", async () => {
    const res = await request(app)
      .delete(`/tarefas/${tarefaId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.erro).toBe("Tarefa não encontrada.");
  });
});