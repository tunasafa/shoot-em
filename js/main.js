import { Game } from './game.js';

const game = new Game();

document.addEventListener('DOMContentLoaded', async () => {
    await game.init();
    game.start();
});