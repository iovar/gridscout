// vi: ft=html
const STYLES_UUID = `S${crypto.randomUUID()}`

const getStyles = () => (`
    <style>
        .${STYLES_UUID} {
            display: block;
            container-type: inline-size;
        }

        .container-${STYLES_UUID} {
            aspect-ratio: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            border-style: solid;
            border-width: 2px;
            color: var(--bg-col);
            border-color: var(--bg-col);
            background-color: var(--fg-col);
            font-family: monospace;
            font-size: 16px;
            overflow: hidden;
        }

        .container-${STYLES_UUID}.open {
            color: var(--fg-col);
            border-color: var(--fg-col);
            background-color: var(--bg-col);
        }

        @container (min-width: 32px) {
            .container-${STYLES_UUID} {
                font-size: 24px;
            }
        }

        @container (min-width: 48px) {
            .container-${STYLES_UUID} {
                font-size: 32px;
            }
        }

        @container (min-width: 96px) {
            .container-${STYLES_UUID} {
                font-size: 64px;
            }
        }
    </style>
`);

const getTemplate = (mine, open, flag, total) => (`
    ${ open ? (`
        <div class="container-${STYLES_UUID} open">
            ${
                mine ? 'M' : ''
            }${
                !mine && total ? total : ''
            }${
                !open && flag ? 'F' : ''
            }
        </div>
    `) : (`
        <div class="container-${STYLES_UUID}">
            ${flag ? 'F' : ''}
        </div>
    `)}
`);

// <script>

export class MineFieldBlock extends HTMLElement {
    static register(name='mine-field-block') {
        if (!customElements.get(name)) {
            customElements.define(name, MineFieldBlock);
        }
        document.head.insertAdjacentHTML('beforeend', getStyles());
    }

    static observedAttributes = ['mine', 'open', 'flag', 'total'];
    mine = false
    open = false;
    flag = false;
    total = 0;

    constructor() {
        super();
    }

    connectedCallback() {
        this.setAttribute('class', STYLES_UUID);
        this.render();
    }

    render() {
        const { mine, open, flag, total } = this;
        this.innerHTML = getTemplate(mine, open, flag, total);
    }

    attributeChangedCallback(attr, oldValue, newValue) {
        if (attr === 'total') {
            this[attr] = Number.parseInt(newValue);
        } else {
            this[attr] = newValue === 'true';
        }
        this.render();
    }
}
// </script>
