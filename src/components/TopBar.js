// vi: ft=html
const STYLES_UUID = `S${crypto.randomUUID()}`;

const getStyles = () => (`
    <style>
        .${STYLES_UUID} {
            --container-height: 80px;
            --container-padding: 8px;
            display: block;
            font-size: 48px;
            max-width: 80%;
            margin: 0 auto;
        }

        .container-${STYLES_UUID} {
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: var(--container-height);
            padding: var(--container-padding);
        }

        .button-${STYLES_UUID} {
            height: 100%;
            aspect-ratio: 1;
            filter: hue-rotate(168deg);
            appearance: none;
            background: transparent;
            border: 0;
        }

        .flag-section-${STYLES_UUID} {
            font-size: 24px;
        }

        .emoji-${STYLES_UUID} {
            font-size: 32px;
        }
    </style>
`);

const getTemplate = (playing, won, dead, flag, mines, time) => (`
    <div class="container-${STYLES_UUID}">
        <div class="number-display-${STYLES_UUID}">
            ${mines}
        </div>

        <button class="button-${STYLES_UUID}" onClick="this.closest('.${STYLES_UUID}').onClick()">
            <span class="emoji-${STYLES_UUID}">
                ${!playing && !won && !dead ? '&#x1F642' : ''}
                ${playing ? '&#x1F642' : ''}
                ${dead ? '&#x1F635   ' : ''}
                ${won ? '&#x1F60E' : ''}
            </span>
        </button>

        <section class="flag-section-${STYLES_UUID}">
            <strong>Flag:</strong>
            <label>
                Off: <input
                        onChange="this.closest('.${STYLES_UUID}').onFlag(false)"
                        type="radio"
                        name="flag"
                        ${!flag ? 'checked' : ''}
                     >
            </label>
            <label>
                On: <input
                        onChange="this.closest('.${STYLES_UUID}').onFlag(true)"
                        type="radio"
                        name="flag"
                        ${flag ? 'checked' : ''}
                     >
            </label>
        </section>

        ${playing ? (`
            <div class="number-display-${STYLES_UUID} timer-${STYLES_UUID}">
                ${time}
            </div>
        `) : (`
            <select onChange="this.closest('.${STYLES_UUID}').onSetup(event)">
                <option value="s" ${mines === '010' ? 'selected' : ''}>Small</option>
                <option value="m" ${mines === '040' ? 'selected' : ''}>Medium</option>
                <option value="l" ${mines === '150' ? 'selected' : ''}>Large</option>
            </select>
        `)}
    </div>
`);

// <script>
export class TopBar extends HTMLElement {
    static register(name='top-bar') {
        if(!customElements.get(name)) {
            customElements.define(name, TopBar);
        }

        document.head.insertAdjacentHTML('beforeend', getStyles());
    }
    flag = false;
    time = 0;
    timer = null;
    setup = 0;
    mines = 0;

    static observedAttributes = [
        'won',
        'dead',
        'playing',
        'flag',
        'mines',
        'starttime',
    ];

    constructor() {
        super();
    }

    connectedCallback() {
        this.setAttribute('class', STYLES_UUID);
        this.render();
    }

    render() {
        const { playing, won, dead, flag, mines, starttime } = this;
        const time = starttime ? (new Date().getTime() - starttime) / 1000 : 0;
        this.innerHTML = getTemplate(
            playing,
            won,
            dead,
            flag,
            this.zeroPad(mines),
            this.zeroPad(time)
        );
    }

    zeroPad(num = 0) {
        const numStr = num.toFixed(0);
        const toAdd = 3 - numStr.length;

        return toAdd > 0 ? '0'.repeat(toAdd) + numStr : numStr;
    }

    playingToggle(oldValue, newValue) {
        window.clearInterval(this.timer);

        if (newValue === true && oldValue === false) {
            this.timer = window.setInterval(() => {
                this.time = this.starttime ? (new Date().getTime() - this.starttime) / 1000 : 0;
                const timerEl = this.querySelector(`.timer-${STYLES_UUID}`);
                if (timerEl) {
                    timerEl.innerHTML = this.zeroPad(this.time);
                }
            }, 1000);
        } else if (newValue === false && oldValue === true) {
            window.clearInterval(this.timer);
            this.timer = 0;
            this.render();
        }
    }

    attributeChangedCallback(attr, oldValue, newValue) {
        if (['dead', 'won', 'flag', 'playing'].includes(attr)) {
            this[attr] = newValue === 'true';
        } else if (['mines', 'starttime'].includes(attr)) {
            this[attr] = Number.parseInt(newValue);
        }

        if (attr === 'playing') {
            this.playingToggle(!this.playing, this.playing);
        } else {
            this.render();
        }
    }

    onClick() {
        const ev = new CustomEvent('gameButton', {
            detail: null
        });
        this.dispatchEvent(ev);
        this.playingToggle(false, true);
    }

    onFlag(value) {
        const ev = new CustomEvent('flagToggle', {
            detail: value
        });
        this.dispatchEvent(ev);
    }

    onSetup(event) {
        const ev = new CustomEvent('setupChange', {
            detail: event.target.value
        });
        this.dispatchEvent(ev);
    }
}
// </script>
