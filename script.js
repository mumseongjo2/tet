document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const ROWS = 20;
    const COLS = 10;
    const BLOCK_SIZE = 30;
    const INFO_WIDTH = 150;



    const moveLeftButton = document.getElementById("moveLeft");
    const moveRightButton = document.getElementById("moveRight");
    const rotateButton = document.getElementById("rotate");
    const moveDownButton = document.getElementById("moveDown");
    const dropNowButton = document.getElementById("dropNow");

    moveLeftButton.addEventListener("click", () => {
        if (!collide(currentX - 1, currentY, currentShape)) {
            currentX--;
            drawBoard();
        }
    });

    moveRightButton.addEventListener("click", () => {
        if (!collide(currentX + 1, currentY, currentShape)) {
            currentX++;
            drawBoard();
        }
    });

    rotateButton.addEventListener("click", () => {
        const rotatedShape = rotateShape(currentShape);
        if (!collide(currentX, currentY, rotatedShape)) {
            currentShape = rotatedShape;
            drawBoard();
        }
    });

    moveDownButton.addEventListener("click", () => {
        drop();
    });

    dropNowButton.addEventListener("click", () => {
        while (!collide(currentX, currentY + 1, currentShape)) {
            currentY++;
        }
        drop();
    });


    canvas.width = COLS * BLOCK_SIZE + INFO_WIDTH;
    canvas.height = ROWS * BLOCK_SIZE;

    const COLORS = [
        '#A8D5E2', '#FBC4AB', '#CDE7B0', '#F9D3B4', '#E8D7F1', '#FAD2E1', '#FFE4A3'
    ];


    const SHAPES = [
        [[1, 1, 1, 1]], 
        [[1, 1, 0], [0, 1, 1]], 
        [[0, 1, 1], [1, 1, 0]], 
        [[1, 1, 1], [0, 1, 0]], 
        [[1, 1, 1], [1, 0, 0]], 
        [[1, 1, 1], [0, 0, 1]], 
        [[1, 1], [1, 1]] 
    ];

    let board, currentShape, currentX, currentY, currentColor, blockLabels, intervalTime, intervalId, linesCleared, gameOver, startTime;
    const restartButton = document.getElementById('restartButton');
    restartButton.style.display = "block";  // 초기 화면에서 버튼을 보이게 설정

    // Star image
    const starImg = new Image();
    starImg.src = "star.png"; 

    let starPositions = {};  

    function initGame() {
        board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
        currentShape = null;
        currentX = 4;
        currentY = 0;
        currentColor = null;
        blockLabels = {};
        starPositions = {};  
        intervalTime = 1000
        linesCleared = 0;
        gameOver = false;
        startTime = Date.now();
	    starCount = 0; // 별 카운트를 0으로 초기화
        restartButton.style.display = "none"; // 게임이 시작되면 버튼 숨기기
        resetShape();
        clearInterval(intervalId);
        intervalId = setInterval(drop, intervalTime);
        drawBoard();
    }

	    // 게임 시작 버튼 클릭 이벤트
    restartButton.addEventListener('click', initGame);

function drawBlock(x, y, color, label = '') {
    const blockX = x * BLOCK_SIZE;
    const blockY = y * BLOCK_SIZE;

    // 블록 배경 그리기 (그라데이션 추가)
    const gradient = ctx.createLinearGradient(blockX, blockY, blockX, blockY + BLOCK_SIZE);
    gradient.addColorStop(0, shadeColor(color, -20)); // 상단 색상 (밝게)
    gradient.addColorStop(1, shadeColor(color, 20));  // 하단 색상 (어둡게)

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(blockX, blockY, BLOCK_SIZE, BLOCK_SIZE, 6); // 모서리를 둥글게
    ctx.fill();

    // 블록 테두리
    ctx.strokeStyle = shadeColor(color, -40); // 어두운 테두리
    ctx.lineWidth = 2;
    ctx.stroke();

    // 광택 효과 추가
    const glossGradient = ctx.createLinearGradient(blockX, blockY, blockX, blockY + BLOCK_SIZE / 2);
    glossGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
    glossGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glossGradient;
    ctx.beginPath();
    ctx.roundRect(blockX + 2, blockY + 2, BLOCK_SIZE - 4, BLOCK_SIZE / 2, 4);
    ctx.fill();

 

    // 레이블 (별 또는 텍스트)
    if (label === 'star' || starPositions[`${y}-${x}`]) {
        ctx.shadowBlur = 0; // 텍스트나 별에는 그림자 제거
        ctx.drawImage(starImg, blockX, blockY, BLOCK_SIZE, BLOCK_SIZE); // 별 이미지
    } else if (label) {
        ctx.shadowBlur = 0; // 텍스트나 별에는 그림자 제거
        ctx.fillStyle = "#000";
        ctx.font = "bold 12px Arial";
        ctx.fillText(label, blockX + BLOCK_SIZE / 4, blockY + BLOCK_SIZE / 1.5);
    }
}

// 색상을 밝게/어둡게 조정하는 함수
function shadeColor(color, percent) {
    const num = parseInt(color.slice(1), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + percent));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + percent));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + percent));
    return `rgb(${r}, ${g}, ${b})`;
}

// CanvasRenderingContext2D의 roundRect 메서드 구현
CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
};

let starCount = 0; // 별 카운트를 저장할 변수 추가



    function drawBoard() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 배경 이미지 설정
//    if (backgroundImg.complete) {  // 이미지가 로드되었는지 확인
//        ctx.drawImage(backgroundImg, 0, 0, COLS * BLOCK_SIZE, ROWS * BLOCK_SIZE);  // 이미지 크기에 맞게 그리기
//    } else {
//        backgroundImg.onload = () => {
//            ctx.drawImage(backgroundImg, 0, 0, COLS * BLOCK_SIZE, ROWS * BLOCK_SIZE); // 이미지가 로드되면 그리기
//        };
//    }

    // 격자 그리기
    ctx.strokeStyle = "#ccc";  // 격자 선 색상
    ctx.lineWidth = 0.5;
    for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * BLOCK_SIZE);
        ctx.lineTo(COLS * BLOCK_SIZE, y * BLOCK_SIZE);
        ctx.stroke();
    }
    for (let x = 0; x <= COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * BLOCK_SIZE, 0);
        ctx.lineTo(x * BLOCK_SIZE, ROWS * BLOCK_SIZE);
        ctx.stroke();
    }

    // 블록 그리기
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x]) {
                drawBlock(x, y, COLORS[board[y][x] - 1], blockLabels[`${y}-${x}`] || '');
            }
        }
    }

    // 현재 블록 그리기
    for (let y = 0; y < currentShape.length; y++) {
        for (let x = 0; x < currentShape[y].length; x++) {
            if (currentShape[y][x]) {
                const label = blockLabels[`${y}-${x}`] || '';
                drawBlock(currentX + x, currentY + y, currentColor, label);
            }
        }
    }

    // 오른쪽 정보 표시 영역 그리기
    ctx.fillStyle = "#fff";
    ctx.fillRect(COLS * BLOCK_SIZE, 0, INFO_WIDTH, canvas.height);
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(COLS * BLOCK_SIZE, 0);
    ctx.lineTo(COLS * BLOCK_SIZE, canvas.height);
    ctx.stroke();

    // 게임 시간과 통계 표시
    ctx.fillStyle = "#000";
    ctx.font = "14px Arial";
    ctx.fillText("시간: " + formatTime(elapsedTime()), COLS * BLOCK_SIZE + 10, 30);
    ctx.fillText("삭제된 라인: " + linesCleared, COLS * BLOCK_SIZE + 10, 60);
    ctx.fillText("삭제된 별: " + starCount, COLS * BLOCK_SIZE + 10, 90);

    // 게임 오버 처리
    if (gameOver) {
        ctx.fillStyle = "#5f5c00";
        ctx.font = "16px Arial";
        ctx.fillText(`별 ${starCount}개!`, COLS * BLOCK_SIZE + 10, canvas.height / 2);
        restartButton.style.display = "block"; // 게임 오버 시에만 버튼 보이게 설정
    }
}

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        seconds = seconds % 60;
        return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    }

    function elapsedTime() {
        return Math.floor((Date.now() - startTime) / 1000);
    }

    function resetShape() {
        const index = Math.floor(Math.random() * SHAPES.length);
        currentShape = SHAPES[index];
        currentColor = COLORS[index];
        currentX = 4;
        currentY = 0;

        blockLabels = {};
//        let labelChar = 'A';   //블록에 글자표시
        for (let y = 0; y < currentShape.length; y++) {
            for (let x = 0; x < currentShape[y].length; x++) {
                if (currentShape[y][x]) {
                    // 0.5% 확률로 해당 칸에 star 이미지가 표시되도록 설정
                    const label = Math.random() < 0.05 ? 'star' : '';//labelChar;  //블록에 글자표시
                    blockLabels[`${y}-${x}`] = label;

//                    if (label !== 'star') {
//                        labelChar = String.fromCharCode(labelChar.charCodeAt(0) + 1);
//                    } //블록에 글자표시
                }
            }
        }
    }

function rotateShape(shape) {
    const rotated = shape[0].map((_, i) => shape.map(row => row[i]).reverse());

    // 회전 전 레이블 상태 임시 저장
    const prevLabels = { ...blockLabels };
    const newLabels = {};

    // 새 위치에 대한 레이블 할당
    Object.keys(blockLabels).forEach(key => {
        const [y, x] = key.split('-').map(Number);
        const newX = shape.length - 1 - y;
        const newY = x;
        newLabels[`${newY}-${newX}`] = blockLabels[key];
    });

    // 회전이 가능한 경우에만 레이블을 업데이트
    if (!collide(currentX, currentY, rotated)) {
        blockLabels = newLabels;
        return rotated;
    } else {
        // 회전이 불가능하면 기존 레이블 상태로 유지
        blockLabels = prevLabels;
        return shape; // 기존 모양을 반환하여 회전을 적용하지 않음
    }
}
    function collide(x, y, shape) {
        return shape.some((row, dy) => 
            row.some((cell, dx) => 
                cell && (board[y + dy] === undefined || board[y + dy][x + dx] !== 0)
            )
        );
    }

    function freeze() {
        currentShape.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell) {
                    const label = blockLabels[`${y}-${x}`];
                    board[currentY + y][currentX + x] = COLORS.indexOf(currentColor) + 1;
                    blockLabels[`${currentY + y}-${currentX + x}`] = label;

                    // 별을 저장하려면, 별 위치를 `starPositions`에 추가
                    if (label === 'star') {
                        starPositions[`${currentY + y}-${currentX + x}`] = true;
                    }
                }
            });
        });
    }

function removeLines() {
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            // 삭제된 라인의 별 개수를 확인
            board[y].forEach((cell, x) => {
                if (starPositions[`${y}-${x}`]) {
                    starCount++; // 별이 있는 경우 카운트 증가
                    delete starPositions[`${y}-${x}`]; // 별 위치 삭제
                }
            });

            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));

            const newBlockLabels = {};
            for (const [key, label] of Object.entries(blockLabels)) {
                const [blockY, blockX] = key.split('-').map(Number);
                if (blockY < y) {
                    newBlockLabels[`${blockY + 1}-${blockX}`] = label;
                } else if (blockY > y) {
                    newBlockLabels[`${blockY}-${blockX}`] = label;
                }
            }
            blockLabels = newBlockLabels;

            // 별 위치도 한 칸씩 위로 밀기
            const newStarPositions = {};
            for (const key in starPositions) {
                const [starY, starX] = key.split('-').map(Number);
                if (starY < y) {
                    newStarPositions[`${starY + 1}-${starX}`] = true;
                } else if (starY > y) {
                    newStarPositions[key] = true;
                }
            }
            starPositions = newStarPositions;

            linesCleared++;
            intervalTime = Math.max(150, 1000 - linesCleared * 500);
            clearInterval(intervalId);
            intervalId = setInterval(drop, intervalTime);

            y++;
        }
    }
}

    function drop() {
        if (collide(currentX, currentY + 1, currentShape)) {
            freeze();
            removeLines();
            resetShape();
            if (collide(currentX, currentY, currentShape)) {
                gameOver = true;
                clearInterval(intervalId);
            }
        } else {
            currentY++;
        }
        drawBoard();
    }

    document.addEventListener("keydown", event => {
        if (gameOver) return;

        let moved = false;
        switch (event.key) {
            case "ArrowLeft":
                if (!collide(currentX - 1, currentY, currentShape)) {
                    currentX--;
                    moved = true;
                }
                break;
            case "ArrowRight":
                if (!collide(currentX + 1, currentY, currentShape)) {
                    currentX++;
                    moved = true;
                }
                break;
            case "ArrowDown":
                drop();
                return;
            case "ArrowUp":
                const rotatedShape = rotateShape(currentShape);
                if (!collide(currentX, currentY, rotatedShape)) {
                    currentShape = rotatedShape;
                    moved = true;
                }
                break;
            case " ":
                while (!collide(currentX, currentY + 1, currentShape)) {
                    currentY++;
                }
                drop();
                return;
        }
        if (moved) drawBoard();
    });

    restartButton.addEventListener('click', initGame);
    initGame();
});
