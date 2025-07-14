from flask import Flask, render_template, request, redirect, url_for, session
import random
import json

app = Flask(__name__)
app.secret_key = 'bns-secret-key'

# Home page to select number of players and enter names
@app.route('/')
def index():
    return render_template('index.html')

# Route to initialize game session with player data
@app.route('/start', methods=['POST'])
def start():
    num_players = int(request.form['num_players'])
    player_names = [request.form.get(f'player_{i}') for i in range(num_players)]
    session['players'] = player_names
    return redirect(url_for('game'))

# Main game board route
@app.route('/game')
def game():
    players = session.get('players', [])
    return render_template('game.html', players=players)

# Route to return a random question (for snake/ladder)
@app.route('/get_question')
def get_question():
    with open('data/questions.json', encoding='utf-8') as f:
        questions = json.load(f)
    question = random.choice(questions)
    return question

if __name__ == '__main__':
    app.run(debug=True)

