// vi: ft=html
import { gameLoop } from '../game/game.js';

const STYLES_UUID = `S${crypto.randomUUID()}`

const getStyles = () => (`
    <style>
        .${STYLES_UUID} {
            display: block;
            aspect-ratio: 1;
            width: 100%;
            height: 100%;
        }

        .container-${STYLES_UUID} {
            aspect-ratio: 1;
            width: 100%;
            height: 100%;
        }

        .game-container-${STYLES_UUID} {
            aspect-ratio: 1;
            max-width: 100%;
            height: calc(100% - 80px);
            margin: auto;
        }

        @container (orientation: portrait) {
            .container-${STYLES_UUID} {
                max-width: 100%;
                height: auto;
                margin-top: auto;
                margin-bottom: auto;
            }
        }

        @container (orientation: landscape) {
            .container-${STYLES_UUID} {
                width: auto;
                max-height: 100%;
                margin-left: auto;
                margin-right: auto;
            }
        }

        .cell-${STYLES_UUID} {
            flex: 1;
        }
    </style>
`);

const getTemplate = (board, playing, won, mines, startTime, flagToggle, dead, size) => (`
    <style>
        .row-${STYLES_UUID} {
            display: grid;
            grid-template-columns: repeat(${size}, 1fr);
        }
    </style>

    <div class="container-${STYLES_UUID}">
        <top-bar
            won="${won}"
            dead="${dead}"
            playing="${playing}"
            mines="${mines}"
            starttime="${startTime}"
            flag="${flagToggle}"
        ></top-bar>
        <div
            class="game-container-${STYLES_UUID}"
            onclick="this.closest('.${STYLES_UUID}').onClick(event)"
            oncontextmenu="this.closest('.${STYLES_UUID}').onContextMenu(event)"
        >
            ${board.map((row, y) => (
                `<div class="row-${STYLES_UUID}">${
                    row.map(({ mine, open, flag, total }, x) => `
                        <mine-field-block
                            data-pos="${x},${y}"
                            mine="${mine}"
                            open="${open}"
                            flag="${flag}"
                            total="${total}"
                        ></mine-field-block>
                    `).join('')
                }</div>`
            )).join('')}
    </div>
`);

// <script>
export class GameContainer extends HTMLElement {
    static register(name='game-container') {
        if (!customElements.get('game-container')) {
            customElements.define(name, GameContainer);
        }
        document.head.insertAdjacentHTML('beforeend', getStyles());
    }

    static observedAttributes = ['size', 'mines'];
    flag = false;
    size = 5;
    mines = 5;
    game = null;

    constructor() {
        super();
    }

    connectedCallback() {
        this.setAttribute('class', STYLES_UUID);
        this.game = gameLoop(this.size, this.mines);
        this.render();
    }

    render(move) {
        const { value, done } = this.game.next(move);
        if (done) {
            return;
        }
        const { board, dead, won, startTime } = value;
        const playing = !!move && !dead && !won;
        this.flag = false;
        this.innerHTML = getTemplate(board, playing, won, this.mines, startTime, this.flag, dead, this.size);

        const topBar = this.querySelector('top-bar');
        topBar.addEventListener('gameButton', () => this.onStart());
        topBar.addEventListener('flagToggle', (e) => this.onFlagToggle(e));
        topBar.addEventListener('setupChange', (e) => this.onSetup(e));
    }

    move(pos, flag) {
        if (!pos) {
            return;
        }
        const [xstr, ystr] = pos.split(',');
        const move = { x: Number.parseInt(xstr), y: Number.parseInt(ystr), flag };
        this.render(move);
    }

    onClick(event) {

        const pos = event.target.closest('mine-field-block').dataset.pos;
        this.move(pos, this.flag);
    }

    onContextMenu(event) {
        event.preventDefault();
        const pos = event.target.closest('mine-field-block').dataset.pos;
        this.move(pos, true);
        return false;
    }

    attributeChangedCallback(attr, oldValue, newValue) {
        const val = Number.parseInt(newValue);
        this[attr] = val;

        if (attr === 'size') {
            this.onStart();
        }
    }

    onSetup(event) {
        const setting = event.detail;

        if (!['s', 'm', 'l'].includes(setting)) {
            return;
        }

        const { size, mines }= {
            s: { size: 9, mines: 10 },
            m: { size: 16, mines: 40 },
            l: { size: 30, mines: 150 },
        }[setting];

        this.setAttribute('mines', mines);
        this.setAttribute('size', size);
    }

    onStart() {
        this.game = gameLoop(this.size, this.mines);
        this.render();
    }

    onFlagToggle(event) {
        this.flag = event.detail === true;
    }
}
// </script>
