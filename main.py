from flask import Flask, request, jsonify
import sqlite3
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Permite requisições de outros domínios (como o app mobile)

# === Banco de Dados SQLite ===

def init_db():
    conn = sqlite3.connect('database.db')
    c = conn.cursor()

    # Tabela de bandas
    c.execute('''
        CREATE TABLE IF NOT EXISTS bandas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL
        )
    ''')

    # Tabela de músicas por banda
    c.execute('''
        CREATE TABLE IF NOT EXISTS setlist (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            banda_id INTEGER,
            nome_musica TEXT,
            link TEXT,
            FOREIGN KEY (banda_id) REFERENCES bandas(id)
        )
    ''')

    conn.commit()
    conn.close()

init_db()


# === Função auxiliar para conectar ao banco ===
def get_db():
    return sqlite3.connect('database.db')


# === Rota para cadastro de banda ===
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    nome = data.get('nome')
    senha = data.get('senha')

    conn = get_db()
    c = conn.cursor()

    try:
        c.execute("INSERT INTO bandas (nome, senha) VALUES (?, ?)", (nome, senha))
        conn.commit()
        return jsonify({'message': 'Banda registrada com sucesso'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Nome de banda já existe'}), 409
    finally:
        conn.close()


# === Rota de login da banda ===
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    nome = data.get('nome')
    senha = data.get('senha')

    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT id FROM bandas WHERE nome = ? AND senha = ?", (nome, senha))
    row = c.fetchone()
    conn.close()

    if row:
        return jsonify({'message': 'Login bem-sucedido', 'banda_id': row[0]})
    else:
        return jsonify({'error': 'Credenciais inválidas'}), 401


# === Rota para adicionar música na setlist ===
@app.route('/setlist', methods=['POST'])
def add_music():
    data = request.get_json()
    banda_id = data.get('banda_id')
    nome_musica = data.get('nome_musica')
    link = data.get('link')

    conn = get_db()
    c = conn.cursor()

    # Verifica se já atingiu o limite de 250 músicas
    c.execute("SELECT COUNT(*) FROM setlist WHERE banda_id = ?", (banda_id,))
    count = c.fetchone()[0]

    if count >= 250:
        conn.close()
        return jsonify({'error': 'Limite de 250 músicas atingido'}), 400

    c.execute("INSERT INTO setlist (banda_id, nome_musica, link) VALUES (?, ?, ?)",
              (banda_id, nome_musica, link))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Música adicionada com sucesso'}), 201


# === Rota para listar músicas da banda ===
@app.route('/setlist/<int:banda_id>', methods=['GET'])
def get_setlist(banda_id):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT id, nome_musica, link FROM setlist WHERE banda_id = ?", (banda_id,))
    musicas = [{'id': row[0], 'nome_musica': row[1], 'link': row[2]} for row in c.fetchall()]
    conn.close()
    return jsonify(musicas)


# === Rota para remover uma música ===
@app.route('/setlist/<int:id>', methods=['DELETE'])
def delete_music(id):
    conn = get_db()
    c = conn.cursor()
    c.execute("DELETE FROM setlist WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Música removida com sucesso'})


# === Rota para editar uma música (opcional) ===
@app.route('/setlist/<int:id>', methods=['PUT'])
def edit_music(id):
    data = request.get_json()
    nome_musica = data.get('nome_musica')
    link = data.get('link')

    conn = get_db()
    c = conn.cursor()
    c.execute("UPDATE setlist SET nome_musica = ?, link = ? WHERE id = ?",
              (nome_musica, link, id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Música atualizada com sucesso'})


# === Iniciar servidor ===
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)