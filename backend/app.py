from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import os
from datetime import datetime

app = Flask(__name__)

app.secret_key = 'visionario_frases_secret_key_2026'
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app, supports_credentials=True)

db = SQLAlchemy(app)

login_manager = LoginManager()
login_manager.init_app(app)

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='user')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Frase(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(100), nullable=False)
    texto = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class PageView(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    views = db.Column(db.Integer, default=0)


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


with app.app_context():
    db.create_all()

    # Cria admins apenas se não existirem
    if not User.query.filter_by(username='derik').first():
        derik = User(username='derik', role='admin')
        derik.set_password('#10void22')
        db.session.add(derik)

    if not User.query.filter_by(username='klaus').first():
        klaus = User(username='klaus', role='admin')
        klaus.set_password('@22shadown14')
        db.session.add(klaus)

    db.session.commit()

    if not PageView.query.first():
        db.session.add(PageView(views=0))
        db.session.commit()


@app.route('/')
def hello():
    return "Backend Visionário Frases rodando 🚀"


@app.route('/api/frases', methods=['GET'])
def get_frases():
    frases = Frase.query.all()
    return jsonify([{
        'id': f.id,
        'titulo': f.titulo,
        'texto': f.texto
    } for f in frases])


@app.route('/api/frases', methods=['POST'])
@login_required
def add_frase():
    if current_user.role != 'admin':
        return jsonify({"error": "Apenas admins podem adicionar frases"}), 403

    data = request.get_json()
    if not data or not data.get('titulo') or not data.get('texto'):
        return jsonify({"error": "Título e texto são obrigatórios"}), 400

    nova_frase = Frase(titulo=data['titulo'], texto=data['texto'])
    db.session.add(nova_frase)
    db.session.commit()

    return jsonify({'id': nova_frase.id, 'titulo': nova_frase.titulo, 'texto': nova_frase.texto}), 201


@app.route('/api/frases/<int:frase_id>', methods=['DELETE'])
@login_required
def delete_frase(frase_id):
    if current_user.role != 'admin':
        return jsonify({"error": "Apenas admins podem deletar frases"}), 403

    frase = Frase.query.get_or_404(frase_id)
    db.session.delete(frase)
    db.session.commit()
    return jsonify({"message": "Frase deletada com sucesso"}), 200


@app.route('/api/views', methods=['GET'])
def get_views():
    view = PageView.query.first()
    return jsonify({"views": view.views if view else 0})


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data.get('username')).first()
    if user and user.check_password(data.get('password')):
        login_user(user)
        return jsonify({
            "message": "Login realizado",
            "username": user.username,
            "role": user.role
        }), 200
    return jsonify({"error": "Credenciais inválidas"}), 401


@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logout realizado"}), 200


if __name__ == '__main__':
    app.run(debug=True)