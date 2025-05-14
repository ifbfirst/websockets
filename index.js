import { httpServer } from './src/http_server/index.js';

const HTTP_PORT = 8181;
httpServer.listen(HTTP_PORT, () => {
    console.log(`HTTP is running on port ${HTTP_PORT}`);
    import('./src/ws.js'); 
});

