# G42 Grammatiklernspiel

Passiversatzformen

# Features

- Responsive design, mobile and desktop friendly.
- Autoreconnect, no need to fear unstable connections.
- Flexible player count.
<<<<<<< HEAD
- End early if desired. Dynamic game length.
=======
>>>>>>> ceebf788a6a372ed100cc9907e5c6f0c9b1a0d23
- No personal data is collected.
- AGPL license, free to modify and redistribute.
- Customization. Dark mode and multiple themes.
- English and German user interface.

Try it here
- https://kykvit.com/gSpiel
- https://grammatikspiel.herokuapp.com/

# Rules

## Two words
There is a set of two words, and two type of players, the majority of the players "the normal ones" will get one word, and the other(s) will get the other word.

## For two type of players
As the normal player you get points for figuring out who was the imposter, and as imposter (the player with the different word), you get points when the normal players vote incorrectly.

## Build sentences using Passiversatz
Everybody will need to invent sentences in Passiversatz form related to their word. Of course you shall not reveal your word nor which type of player you are.
z.B.:
- Zug:  Man fährt(reisen) zu können......
- Reise: Man sieht viele schöne Dinge...

## Gameplay details
You WILL know if you have the normal word, or if you have the different word.

If you have the normal word, you simply need to listen and figure out who has the different word.

If you have the different word, your objective is to build correct and plausible sentences related to your word, while not letting the others know that you are the different one.

At the end of each round, the normal players need to vote who was(were) the imposter, not voting equals an incorrect vote.

If after the reveal the players think that the imposter's sentences were not related to their word, they have a chance to evaluate the imposter. This will affect the score the imposter gets. Not evaluating equals perfect score.

## Game parameters
Everybody talks one time each round for 30 seconds, voting and evaluating takes place after each round.

The number of rounds is determined by the number of players.

For every five players there's one imposter.
- 3-5 players: 1 imposter
- 6-10 players: 2 imposters
- 11-15 players: 3 imposters
- usw.

# Grammatikspielregeln

## Zwei Wörter
Es gibt einen Satz von zwei Wörtern und zwei Spielertypen. Die Mehrheit der Spieler, die "Normalen", bekommen ein Wort, der/die andere(n) bekommt/bekommen das andere Wort.

## Für zwei Arten von Spielern
Als normaler Spieler bekommen Sie Punkte dafür, dass Sie herausgefunden haben, wer der Betrüger war, und als Betrüger (der Spieler mit dem anderen Wort) bekommen Sie Punkte, wenn die normalen Spieler falsch gewählt haben.

## Sätze bilden mit Passiversatz
Jeder muss in Passiversatzform Sätze zu seinem Wort erfinden. Natürlich darfst du weder dein Wort verraten noch, welcher Spielertyp du bist.
z.B.:
- Zug:  Man fährt (reisen) zu können......
- Reise: Man sieht viele schöne Dinge...

## Gameplay-Details
Sie werden wissen, ob Sie das normale Wort oder das andere Wort haben.

Wenn Sie das normale Wort haben, müssen Sie nur zuhören und herausfinden, wer das andere Wort hat.

Wenn Sie das andere Wort haben, ist es Ihr Ziel, korrekte und plausible Sätze zu Ihrem Wort zu bilden und dabei die anderen nicht wissen zu lassen, dass Sie das andere Wort haben.

Am Ende jeder Runde müssen die normalen Spieler abstimmen, wer der Hochstapler war(en), nicht abstimmen ist gleichbedeutend mit einer falschen Stimme.

Wenn die Spieler nach der Aufdeckung der Meinung sind, dass die Sätze des Hochstaplers nicht mit ihrem Wort übereinstimmen, haben sie die Möglichkeit, den Hochstapler zu bewerten. Dies wirkt sich auf die Punktzahl aus, die der Hochstapler erhält. Nicht zu bewerten ist gleichbedeutend mit der perfekten Punktzahl.

## Spiel-Parameter
Jeder redet einmal pro Runde für 30 Sekunden, nach jeder Runde wird abgestimmt und bewertet.

Die Anzahl der Runden wird durch die Anzahl der Spieler bestimmt.

Für je fünf Spieler gibt es einen Hochstapler.
- 3-5 Spieler: 1 Hochstapler
- 6-10 Spieler: 2 Hochstapler
- 11-15 Spieler: 3 Hochstapler
- usw.

# Running the server with heroku

Use the branches with heroku in the name, no modification is necessary.

# Running the server behind a proxy

To use an address like the one below, some modifications are necessary. 
```
http://example.com/gSpiel/
```
If the address is ```gSpiel``` like above, the modifications are included in the branches named with proxy.

## Modifications

### /public/index.html

<<<<<<< HEAD
- Change the source of ```/css/style.css```
- Change the source of ```/socket.io/socket.io.js```
- Change the source of ```/js/script.js```
- Change the source of ```/font-awesome-4.7.0/css/font-awesome.css```
=======
- Change the source of /css/style.css and the other stylesheets
- Change the source of /socket.io/socket.io.js
- Change the source of /js/script.js
>>>>>>> ceebf788a6a372ed100cc9907e5c6f0c9b1a0d23

### /public/js/script.js

- Change the first line to

```js
let socket = io.connect("/", { path: "/gSpiel/socket.io" });
```
- Change all the sources of the stylesheets.

### /public/css/style.css

Change the source of the font file to
```css
src: url(/gSpiel/font/TitilliumWeb-Regular.ttf);
```

### /index.js

The server uses the port specified by the PORT environment variable, if not present it falls back to 8282.

```js
const PORT = process.env.PORT || 8282;
```

## Example proxy configuration with apache

### Modules 

- LoadModule rewrite_module modules/mod_rewrite.so
- LoadModule proxy_wstunnel_module modules/mod_proxy_wstunnel.so
- LoadModule proxy_http_module modules/mod_proxy_http.so

### Configuration
```apache
RewriteEngine On

RewriteCond %{REQUEST_URI}  ^/gSpiel/socket.io            [NC]
RewriteCond %{QUERY_STRING} transport=websocket    [NC]
RewriteRule /gSpiel/(.*)           ws://127.0.0.1:8282/$1 [P,L]

ProxyPass /gSpiel http://127.0.0.1:8282
ProxyPassReverse /gSpiel http://127.0.0.1:8282
ProxyPass        /gSpiel/socket.io  http://127.0.0.1:8282/socket.io
ProxyPassReverse /gSpiel/socket.io  http://127.0.0.1:8282/socket.io
```
