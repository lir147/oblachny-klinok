# Проверка двумя браузерами

Время: 29.10.2026, 16:38:34

## Браузер 1

**Заголовок «Мир»:** в игре сейчас: 2 · серверов на связи: 2 из 3

```
ВАШ НИК
Сохранить
ДРУЗЬЯ · 0
Друзей пока нет. Добавьте игроков из списка «Сейчас в игре».
СЕЙЧАС В ИГРЕ · 1
弓
Странник8249
Лучник · ур. 1 · БМ 548 · Бронза I · Окрестности деревни Кумо
Добавить
Дуэль
```

**Журнал игры:**
```
Демон Багровой луны пробудился на юго-востоке.
Онлайн: на связи серверов 1 из 3 (broker.hivemq.com).
Нажмите на «Воин» ещё раз, чтобы выбрать навсегда.
Ваш путь: Воин.
```

**Консоль и сеть:**
```
warning: [.WebGL-0x148c00151400]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels
ws open wss://broker.emqx.io:8084/mqtt
ws open wss://broker.hivemq.com:8884/mqtt
ws open wss://test.mosquitto.org:8081/mqtt
warning: [.WebGL-0x148c00151400]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels
ws sent 1 frames to wss://broker.emqx.io:8084/mqtt
ws sent 1 frames to wss://broker.hivemq.com:8884/mqtt
warning: [.WebGL-0x148c00151400]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels
ws error wss://test.mosquitto.org:8081/mqtt Connection closed before receiving a handshake response
error: WebSocket connection to 'wss://test.mosquitto.org:8081/mqtt' failed: Connection closed before receiving a handshake response
warning: [.WebGL-0x148c00151400]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (this message will no longer repeat)
ws close wss://test.mosquitto.org:8081/mqtt
ws sent 5 frames to wss://broker.hivemq.com:8884/mqtt
ws sent 5 frames to wss://broker.emqx.io:8084/mqtt
ws open wss://test.mosquitto.org:8081/mqtt
ws error wss://test.mosquitto.org:8081/mqtt Connection closed before receiving a handshake response
error: WebSocket connection to 'wss://test.mosquitto.org:8081/mqtt' failed: Connection closed before receiving a handshake response
ws close wss://test.mosquitto.org:8081/mqtt
ws open wss://test.mosquitto.org:8081/mqtt
ws error wss://test.mosquitto.org:8081/mqtt Connection closed before receiving a handshake response
error: WebSocket connection to 'wss://test.mosquitto.org:8081/mqtt' failed: Connection closed before receiving a handshake response
ws close wss://test.mosquitto.org:8081/mqtt
ws sent 20 frames to wss://broker.hivemq.com:8884/mqtt
```

## Браузер 2

**Заголовок «Мир»:** в игре сейчас: 2 · серверов на связи: 2 из 3

```
ВАШ НИК
Сохранить
ДРУЗЬЯ · 0
Друзей пока нет. Добавьте игроков из списка «Сейчас в игре».
СЕЙЧАС В ИГРЕ · 1
剣
Странник7733
Воин · ур. 1 · БМ 427 · Бронза I · Окрестности деревни Кумо
Добавить
Дуэль
```

**Журнал игры:**
```
Демон Багровой луны пробудился на юго-востоке.
Онлайн: на связи серверов 1 из 3 (broker.emqx.io).
Нажмите на «Лучник» ещё раз, чтобы выбрать навсегда.
Ваш путь: Лучник.
```

**Консоль и сеть:**
```
ws open wss://broker.emqx.io:8084/mqtt
ws open wss://test.mosquitto.org:8081/mqtt
ws open wss://broker.hivemq.com:8884/mqtt
ws sent 1 frames to wss://broker.emqx.io:8084/mqtt
ws sent 1 frames to wss://broker.hivemq.com:8884/mqtt
ws error wss://test.mosquitto.org:8081/mqtt Connection closed before receiving a handshake response
error: WebSocket connection to 'wss://test.mosquitto.org:8081/mqtt' failed: Connection closed before receiving a handshake response
ws sent 5 frames to wss://broker.emqx.io:8084/mqtt
ws close wss://test.mosquitto.org:8081/mqtt
ws sent 5 frames to wss://broker.hivemq.com:8884/mqtt
ws open wss://test.mosquitto.org:8081/mqtt
ws error wss://test.mosquitto.org:8081/mqtt Connection closed before receiving a handshake response
error: WebSocket connection to 'wss://test.mosquitto.org:8081/mqtt' failed: Connection closed before receiving a handshake response
ws close wss://test.mosquitto.org:8081/mqtt
```
