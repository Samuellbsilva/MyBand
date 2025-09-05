# 🎸 API de Setlist para Bandas

Uma API RESTful simples e leve, desenvolvida com **Flask** e **SQLite**, para gerenciamento de repertórios musicais de bandas.  
Ideal para aplicações **mobile** ou **web** que precisam de um backend ágil para cadastrar bandas, fazer login e gerenciar setlists com até 250 músicas.

---

## 🚀 Funcionalidades

- **Cadastro de Bandas**  
  Crie uma conta para sua banda com nome de usuário e senha.

- **Login de Banda**  
  Autentique-se para acessar e modificar a setlist da banda.

- **Adicionar Música**  
  Insira músicas na setlist da banda, informando nome e link (YouTube, Cifra Club, etc).

- **Listar Músicas**  
  Visualize todas as músicas cadastradas para uma banda.

- **Editar Música**  
  Atualize o nome ou link de uma música já cadastrada.

- **Remover Música**  
  Exclua músicas da setlist.

- **Controle de Limite**  
  Cada banda pode adicionar até **250 músicas**.

---

## 🛠 Tecnologias Utilizadas

- **Python** – Linguagem principal do projeto  
- **Flask** – Microframework web para criação da API  
- **SQLite** – Banco de dados leve, ideal para aplicações locais e embarcadas  
- **Flask-CORS** – Permite que o frontend (mobile ou web) se comunique com a API de forma segura

---
