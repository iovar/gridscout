const generateBoard = (size, mines) => {
    let totalPlaced = 0;
    let remainingBlocks = Math.pow(size, 2);

    const boardNN = Array.from({ length: size }, (_, y) => (
        Array.from({ length: size }, (_, x) => {
            const chance = (mines - totalPlaced)/remainingBlocks;
            remainingBlocks--;

            if (Math.random() > chance) {
                return { mine: false, open: false, flag: false, total: 0 };
            }

            totalPlaced ++;
            return { mine: true, open: false, flag: false, total: 0 };
        })
    ));

    const board = boardNN.map((row, y) => row.map((cell, x) => {
        let total = 0;
        for (let x1 = x - 1; x1 <= x + 1; x1++) {
            for (let y1 = y - 1; y1 <= y + 1; y1++) {
                if (boardNN[y1]?.[x1]?.mine) {
                    total++;
                }
            }
        }
        return total ? { ...cell, total } : cell;
    }));

    return { board, totalPlaced };
};

const replaceAt = (x, y, board, block) => ([
    ...board.slice(0, y),
    [ ...board[y].slice(0, x), block, ...board[y].slice(x + 1) ],
    ...board.slice(y + 1)
]);

const cellCanOpen = (x, y, board) => (
    !board[y][x].open && !board[y][x].mine
);

const openAllNeighbours = (x, y, originalBoard, depth = 0) => {
    let board = originalBoard;
    let runAt = [];

    for (let x1 = x - 1; x1 <= x + 1; x1++) {
        for (let y1 = y - 1; y1 <= y + 1; y1++) {
            const inBounds = x1 >= 0 && y1 >= 0 && y1 < board.length && x1 < board[y1].length;
            const notSame = x1 !== x || y1 !== y;
            if (inBounds && notSame && cellCanOpen(x1, y1, board)) {
                board = replaceAt(x1, y1, board, {...board[y1][x1], open: true });
                if (!board[y1][x1].total) {
                    runAt.push({ x: x1, y: y1 });
                }
            }
        }
    }

    for (let i = 0; i < runAt.length; i++) {
        const pos = runAt[i];
        board = openAllNeighbours(pos.x, pos.y, board, depth + 1);
    }

    return board;
};

const openAll = (board) => (
    board.map((row) => row.map((cell) => ({ ...cell, open: true })))
);

const getRemainingClosed = (board) => (
    board.reduce((rowTotal, row) => (
        row.reduce(
            (total, cell) => (cell.open ? total : total + 1), rowTotal
        )
    ), 0)
);

const isPosOutOfBounds = (x, y, size) => (
    x > size - 1 || x < 0 || y > size -1 || y < 0
);

export function* gameLoop(size, mines) {
    let { board, totalPlaced } = generateBoard(size, mines);
    let dead = false;
    let won = false;
    let startTime = null

    while(!dead && !won) {
        const { x, y, flag } = yield { board, dead, won, startTime };

        if (!startTime) {
            startTime = new Date().getTime();
        }

        if (isPosOutOfBounds(x, y, size)) {
            continue;
        }

        const block = board[y][x];

        if (block.open || dead || won) {
            continue;
        }

        if (flag) {
            board = replaceAt(x, y, board, { ...block, flag: !block.flag });
        } else if (block.mine) {
            dead = true;
            board = openAll(board);
        } else if (!block.mine) {
            board = replaceAt(x, y, board, { ...block, open: true });

            if (!block.total) {
                board = openAllNeighbours(x, y, board);
            }

            if (getRemainingClosed(board) === totalPlaced) {
                won = true;
            }
        }
    }

    yield { board, dead, won };
};
