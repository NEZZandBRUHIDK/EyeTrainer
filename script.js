// --- ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ДЛЯ ТАЙМЕРОВ И АНИМАЦИЙ ---
let focusTimer = null; let schulteTimer = null; let fourPointsInterval = null;
let nearFarInterval = null; let blinkingTimer = null; let accommodationInterval = null;
let peripheralInterval = null; let peripheralTimeout = null; let adamasTimer = null;

let trackingAnimation = null; let figure8Animation = null;

let focusClicks = 0; let isGame1Active = false;
let schulteCurrentNumber = 1; let schulteStartTime;
let trackingHits = 0; let trackingGameDuration = 30;
let pointClickScore = 0; let isCenterActive = false; let secondsLeft = 30;
let nearFarCycle = 0; let nearFarScore = 0; const totalCycles = 5;
let figure8StartTime; let figure8Direction = 1;
let blinkingSeconds = 30; let blinkCount = 0;
let accommodationSeconds = 20; let accScore = 0; let isAccSharp = false;
let targetVisible = false; let peripheralFoundCount = 0; let peripheralGameDuration = 30;
let adamasSeconds = 45; let adamasLineScore = 0;
let isNearFocusPhase = false;
let isBlinkingGameActive = false;


// --- УПРАВЛЕНИЕ ТЕМАМИ И КОНТЕНТОМ ---

const themeNames = {
    'dark-theme': 'Темная (Градиент)',
    'light-theme': 'Светлая',
    'blue-theme': 'Синяя'
};

function setTheme(themeName) {
    document.body.classList.remove('dark-theme', 'light-theme', 'blue-theme');
    document.body.classList.add(themeName);
    localStorage.setItem('theme', themeName);
    const themeNameEl = document.getElementById('current-theme-name');
    if (themeNameEl) {
        themeNameEl.textContent = themeNames[themeName];
    }
}

function stopAllTimers() {
    // Остановка всех интервалов и таймаутов
    clearInterval(focusTimer); clearInterval(schulteTimer); clearInterval(fourPointsInterval);
    clearInterval(nearFarInterval); clearInterval(blinkingTimer); clearTimeout(peripheralTimeout);
    clearInterval(peripheralInterval); clearInterval(accommodationInterval); clearInterval(adamasTimer);

    // Остановка анимаций
    if (trackingAnimation) cancelAnimationFrame(trackingAnimation);
    if (figure8Animation) cancelAnimationFrame(figure8Animation);

    focusTimer = schulteTimer = fourPointsInterval = nearFarInterval = blinkingTimer = null;
    accommodationInterval = peripheralInterval = peripheralTimeout = adamasTimer = null;
    trackingAnimation = figure8Animation = null;
    isGame1Active = isNearFocusPhase = isAccSharp = isBlinkingGameActive = false;
    focusClicks = adamasLineScore = peripheralFoundCount = 0;
    
    // Сброс обработчиков событий, связанных с играми
    document.getElementById('focus-point')?.removeEventListener('click', handleFocusClick);
    document.getElementById('near-far-text')?.removeEventListener('click', handleNearFarClick);
    document.getElementById('acc-text')?.removeEventListener('click', handleAccommodationClick);
    document.getElementById('tracking-object')?.removeEventListener('click', handleTrackingHit);
    document.getElementById('figure8-area')?.removeEventListener('click', handleFigure8Click);
    document.getElementById('adamas-grid')?.removeEventListener('click', handleAdamasClick);
}

function hideAllSections() {
    document.querySelectorAll('.content-section, .game-view').forEach(el => {
        el.classList.add('hidden');
    });
}

// Новая универсальная функция для переключения секций
function showSection(sectionId) {
    stopAllTimers();
    hideAllSections();
    const sectionElement = document.getElementById(sectionId);
    if (sectionElement) {
        sectionElement.classList.remove('hidden');
    }
}

// Показать список игр в определенной категории
function showCategoryGames(categoryId) {
    stopAllTimers();
    hideAllSections();
    const categoryElement = document.getElementById(categoryId);
    if (categoryElement) {
        categoryElement.classList.remove('hidden');
    }
}

// Загрузить конкретную игру
function loadGame(gameId) {
    stopAllTimers();
    hideAllSections();
    
    const gameElement = document.getElementById(gameId);
    if (gameElement) {
        // Дополнительный сброс состояния для чистой игры
        if (gameId === 'game-2-schulte') {
            document.getElementById('schulte-table').innerHTML = '';
            document.getElementById('game-2-status').textContent = 'Нажмите Старт.';
        }
        if (gameId === 'game-9-peripheral') {
            document.getElementById('peripheral-target').style.display = 'none';
            document.querySelector('#game-9-peripheral button:last-of-type').disabled = true;
        }

        gameElement.classList.remove('hidden');
    }
}


// --- ЛОГИКА 10 ИНТЕРАКТИВНЫХ ИГР ---

// 1. Быстрый Фокус
let focusSeconds = 30;
function handleFocusClick() {
    const point = document.getElementById('focus-point');
    const display = document.getElementById('game-1-timer-display');
    if (!isGame1Active || !point) return;
    const isBig = point.style.width === '15px';
    if (isBig) {
        focusClicks++; point.style.backgroundColor = '#1a7d1a'; // Успех
    } else {
        focusClicks = Math.max(0, focusClicks - 1); point.style.backgroundColor = '#e74c3c'; // Ошибка
    }
    display.textContent = `Счет: ${focusClicks} | Время: ${focusSeconds}`;
    setTimeout(() => point.style.backgroundColor = '#ffffff', 100);
}

function updateFocusTimer() {
    const display = document.getElementById('game-1-timer-display');
    const point = document.getElementById('focus-point');
    if (!display || !point) { clearInterval(focusTimer); focusTimer = null; isGame1Active = false; return; }
    
    if (focusSeconds <= 0) {
        clearInterval(focusTimer);
        display.textContent = `Упражнение завершено! Финальный счет: ${focusClicks}`;
        point.style.width = '10px'; point.style.height = '10px'; point.removeEventListener('click', handleFocusClick);
        focusTimer = null; isGame1Active = false; return;
    } 
    
    point.style.width = focusSeconds % 3 === 0 ? '15px' : '8px';
    point.style.height = focusSeconds % 3 === 0 ? '15px' : '8px';
    focusSeconds--;
    display.textContent = `Счет: ${focusClicks} | Время: ${focusSeconds}`;
}

function startGameFocus() {
    if (focusTimer) clearInterval(focusTimer);
    focusSeconds = 30; focusClicks = 0; isGame1Active = true;
    const point = document.getElementById('focus-point');
    if (!point) return;
    point.addEventListener('click', handleFocusClick); 
    updateFocusTimer();
    focusTimer = setInterval(updateFocusTimer, 1000);
}


// 2. Таблица Шульте
const schulteSize = 25;
function generateSchulteTable() {
    const table = document.getElementById('schulte-table');
    if (!table) return;
    if (schulteTimer) clearInterval(schulteTimer);
    schulteStartTime = Date.now(); table.innerHTML = '';
    const numbers = Array.from({ length: schulteSize }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
    schulteCurrentNumber = 1;
    schulteTimer = setInterval(() => {
        const statusDisplay = document.getElementById('game-2-status');
        if (statusDisplay) {
            const elapsed = (Date.now() - schulteStartTime) / 1000;
            statusDisplay.textContent = `Ищем: ${schulteCurrentNumber}. Время: ${elapsed.toFixed(1)} сек.`;
        } else { clearInterval(schulteTimer); schulteTimer = null; }
    }, 100);
    numbers.forEach(number => {
        const cell = document.createElement('div');
        cell.classList.add('schulte-cell'); cell.textContent = number;
        cell.dataset.number = number; cell.onclick = handleSchulteClick;
        table.appendChild(cell);
    });
}

function handleSchulteClick(event) {
    if (!schulteTimer || !event.target.dataset.number) return;
    const clickedNumber = parseInt(event.target.dataset.number);
    const statusDisplay = document.getElementById('game-2-status');
    const elapsed = ((Date.now() - schulteStartTime) / 1000).toFixed(1);
    if (!statusDisplay) { clearInterval(schulteTimer); schulteTimer = null; return; }
    if (clickedNumber === schulteCurrentNumber) {
        event.target.classList.add('correct'); event.target.onclick = null; schulteCurrentNumber++;
        if (schulteCurrentNumber > schulteSize) {
            clearInterval(schulteTimer);
            statusDisplay.textContent = `ПОБЕДА! Все числа найдены за ${elapsed} сек!`;
            schulteTimer = null;
        } else { statusDisplay.textContent = `Ищем: ${schulteCurrentNumber}. Время: ${elapsed} сек.`; }
    } else {
        statusDisplay.textContent = `НЕВЕРНО. Ищем: ${schulteCurrentNumber}. Время: ${elapsed} сек.`;
    }
}

function startGameSchulte() { generateSchulteTable(); }


// 3. Перехват Объекта
let trackingStartTime;
function handleTrackingHit(event) {
    const object = document.getElementById('tracking-object');
    if (trackingAnimation && object) {
        trackingHits++;
        object.style.backgroundColor = '#1a7d1a';
        setTimeout(() => {
            const currentObject = document.getElementById('tracking-object');
            if (currentObject) currentObject.style.backgroundColor = '#3498db';
        }, 200);
    }
}

function startTrackingGame() {
    stopTrackingGame();
    const object = document.getElementById('tracking-object');
    const area = document.getElementById('tracking-area');
    if (!object || !area) return;
    const areaSize = area.clientWidth; 
    const objectSize = object.clientWidth;
    const boundary = areaSize - objectSize; 
    trackingStartTime = Date.now(); trackingHits = 0; trackingGameDuration = 30;
    object.addEventListener('click', handleTrackingHit);

    function animate() {
        const elapsed = (Date.now() - trackingStartTime) / 1000;
        const header = document.getElementById('game-3-tracking').querySelector('h2');
        
        if (elapsed >= trackingGameDuration) {
            stopTrackingGame();
            area.style.border = '2px solid #e74c3c';
            if (header) header.textContent = `3. Перехват Объекта (Финал: ${trackingHits})`;
            return;
        }
        if (!object) { stopTrackingGame(); return; }
        
        const x_raw = Math.sin(elapsed * 0.8) * Math.cos(elapsed * 0.4);
        const y_raw = Math.cos(elapsed * 0.7) * Math.sin(elapsed * 0.5);
        const x = (boundary / 2) * (1 + x_raw);
        const y = (boundary / 2) * (1 + y_raw);

        object.style.left = `${x}px`; object.style.top = `${y}px`; object.style.transform = 'none';

        trackingAnimation = requestAnimationFrame(animate);
        if (header) header.textContent = `3. Перехват Объекта (Счет: ${trackingHits}) | Время: ${Math.ceil(trackingGameDuration - elapsed)} сек.`;
    }
    animate();
}

function stopTrackingGame() {
    if (trackingAnimation) { cancelAnimationFrame(trackingAnimation); trackingAnimation = null; }
    const object = document.getElementById('tracking-object');
    const area = document.getElementById('tracking-area');
    if (object) {
        object.style.left = '50%'; object.style.top = '50%';
        object.style.transform = 'translate(-50%, -50%)'; 
        object.removeEventListener('click', handleTrackingHit); 
    }
    if (area) { area.style.border = '2px solid #3498db'; }
}


// 4. Угловой Ритм
const points = ['fp-center', 'fp-top-left', 'fp-top-right', 'fp-bottom-left', 'fp-bottom-right'];
let pointIntervalDuration = 1500; 
let currentPointIndex = 0;

function handlePointClick() {
    const status = document.getElementById('game-4-status');
    if (!status) return;
    if (isCenterActive) {
        pointClickScore++;
        status.textContent = `Верно! Счет: ${pointClickScore}. Осталось: ${Math.ceil(secondsLeft)} сек. Кликай, когда в центре!`;
    } else {
        pointClickScore = Math.max(0, pointClickScore - 1);
        status.textContent = `Мимо! Счет: ${pointClickScore}. Осталось: ${Math.ceil(secondsLeft)} сек. Кликай, когда в центре!`;
    }
}

function startFourPointsGame() {
    if (fourPointsInterval) clearInterval(fourPointsInterval);
    const status = document.getElementById('game-4-status');
    const fourPointsArea = document.getElementById('four-points-area');
    if (!status || !fourPointsArea) return;
    secondsLeft = 30; pointClickScore = 0;
    fourPointsArea.addEventListener('click', handlePointClick);
    document.querySelectorAll('#four-points-area .point').forEach(p => p.classList.remove('active'));
    currentPointIndex = 0;
    
    fourPointsInterval = setInterval(() => {
        secondsLeft -= pointIntervalDuration / 1000;
        document.querySelectorAll('#four-points-area .point').forEach(p => p.classList.remove('active'));
        
        if (secondsLeft <= 0) {
            clearInterval(fourPointsInterval);
            status.textContent = `Упражнение завершено! Финальный счет: ${pointClickScore}`;
            fourPointsArea.removeEventListener('click', handlePointClick); fourPointsInterval = null; return;
        }

        currentPointIndex = (currentPointIndex + 1) % points.length;
        const currentPointId = points[currentPointIndex];
        const currentPointEl = document.getElementById(currentPointId);
        if (currentPointEl) currentPointEl.classList.add('active');

        isCenterActive = (currentPointId === 'fp-center');
        status.textContent = `Смотрите на КРАСНУЮ точку. Счет: ${pointClickScore}. Осталось: ${Math.ceil(secondsLeft)} сек. Кликай, когда в центре!`;

    }, pointIntervalDuration);
}


// 5. Ближний/Дальний фокус
function handleNearFarClick() {
    const statusEl = document.getElementById('game-5-status');
    const textEl = document.getElementById('near-far-text');
    if (!statusEl || !textEl) return;
    if (isNearFocusPhase) {
        nearFarScore++;
        statusEl.textContent = `УСПЕХ! Счет: ${nearFarScore}. Смотрите вдаль (5 сек)`;
        textEl.style.transform = 'scale(0.8)'; textEl.style.color = '#ffffff';
        textEl.removeEventListener('click', handleNearFarClick);
        isNearFocusPhase = false;
    } else {
        nearFarScore = Math.max(0, nearFarScore - 1);
        statusEl.textContent = `Мимо! Счет: ${nearFarScore}. Дождитесь, пока текст станет большим.`;
    }
}

function startNearFarGame() {
    if (nearFarInterval) clearInterval(nearFarInterval);
    const textEl = document.getElementById('near-far-text');
    const statusEl = document.getElementById('game-5-status');
    if (!textEl || !statusEl) return;
    nearFarCycle = 0; nearFarScore = 0; isNearFocusPhase = false;
    
    textEl.style.transform = 'scale(0.8)';
    textEl.style.color = '#ffffff';
    statusEl.textContent = `Начинаем! Смотрите вдаль (5 сек)`;

    function runCycle() {
        if (!textEl || !statusEl) { clearInterval(nearFarInterval); nearFarInterval = null; return; }
        if (nearFarCycle >= totalCycles) {
            clearInterval(nearFarInterval);
            statusEl.textContent = `Упражнение завершено! Финальный счет: ${nearFarScore}`;
            nearFarInterval = null;
            textEl.style.transform = 'scale(1)'; textEl.style.color = '#ff9a00'; textEl.removeEventListener('click', handleNearFarClick);
            return;
        }

        statusEl.textContent = `Цикл ${nearFarCycle + 1}/${totalCycles}: СМОТРИТЕ И КЛИКАЙТЕ ПО ЭКРАНУ (5 сек)`;
        textEl.style.transform = 'scale(1.2)'; textEl.style.color = '#ff9a00';
        textEl.addEventListener('click', handleNearFarClick);  isNearFocusPhase = true;

        setTimeout(() => {
            const currentTextEl = document.getElementById('near-far-text');
            const currentStatusEl = document.getElementById('game-5-status');
            if (!currentTextEl || !currentStatusEl) return;

            if (isNearFocusPhase) {
                currentStatusEl.textContent = `Цикл ${nearFarCycle + 1}/${totalCycles}: ПРОПУСК. Смотрите вдаль (5 сек)`;
            }
            
            currentTextEl.style.transform = 'scale(0.8)'; currentTextEl.style.color = '#ffffff';
            currentTextEl.removeEventListener('click', handleNearFarClick); isNearFocusPhase = false;
            nearFarCycle++; 
            
            if (nearFarCycle < totalCycles) {
                currentStatusEl.textContent = `Смотрите вдаль (5 сек). Счет: ${nearFarScore}.`;
            }
        }, 5000); 
    }
    runCycle();
    nearFarInterval = setInterval(runCycle, 10000); 
}


// 6. Восьмерка
function handleFigure8Click() {
    const area = document.getElementById('figure8-area');
    if (!area) return;
    figure8Direction *= -1;
    area.querySelector('p').textContent = `Направление: ${figure8Direction === 1 ? 'ВПЕРЕД' : 'НАЗАД'}. Кликни, чтобы изменить!`;
}

function startFigure8Game() {
    stopFigure8Game();
    const object = document.getElementById('figure8-object');
    const area = document.getElementById('figure8-area');
    if (!object || !area) return;
    const areaSize = area.clientWidth;
    const radius = areaSize / 3;
    figure8StartTime = Date.now(); figure8Direction = 1;
    area.addEventListener('click', handleFigure8Click);
    const statusParagraph = area.querySelector('p');
    if (statusParagraph) statusParagraph.textContent = `Направление: ВПЕРЕД. Кликни, чтобы изменить!`;

    function animate() {
        if (!object || !area) { stopFigure8Game(); return; }
        const elapsed = (Date.now() - figure8StartTime) / 1000 * figure8Direction;
        const x = radius * Math.cos(elapsed) / (1 + Math.sin(elapsed) * Math.sin(elapsed));
        const y = radius * Math.cos(elapsed) * Math.sin(elapsed) / (1 + Math.sin(elapsed) * Math.sin(elapsed));

        object.style.left = `${areaSize / 2 + x - object.clientWidth / 2}px`;
        object.style.top = `${areaSize / 2 + y - object.clientHeight / 2}px`;
        object.style.transform = 'none';

        figure8Animation = requestAnimationFrame(animate);
    }
    animate();
}

function stopFigure8Game() {
    if (figure8Animation) { cancelAnimationFrame(figure8Animation); figure8Animation = null; }
    const object = document.getElementById('figure8-object');
    const area = document.getElementById('figure8-area');
    if (object) {
        object.style.left = '50%'; object.style.top = '50%';
        object.style.transform = 'translate(-50%, -50%)'; 
    }
    if (area) {
        area.removeEventListener('click', handleFigure8Click);
        const statusParagraph = area.querySelector('p');
        if (statusParagraph) statusParagraph.textContent = 'Нажмите Старт для начала движения.';
    }
}


// 7. Быстрое моргание
function handleBlinkClick() {
    const display = document.getElementById('game-7-timer-display');
    if (!display) return;
    
    if (isBlinkingGameActive) {
        blinkCount++;
        display.textContent = `Моргайте! Счет: ${blinkCount} | Время: ${blinkingSeconds}`;
    }
}

function startGameBlinking() {
    if (blinkingTimer) clearInterval(blinkingTimer);
    
    const display = document.getElementById('game-7-timer-display');
    const gameContainer = document.getElementById('game-7-blinking');
    if (!display || !gameContainer) return;

    const button = gameContainer.querySelector('button');
    if (!button) return;
    
    blinkingSeconds = 30; blinkCount = 0; isBlinkingGameActive = true;
    button.removeEventListener('click', startGameBlinking);
    button.addEventListener('click', handleBlinkClick);
    button.textContent = 'КЛИКНИ, КОГДА МОРГНУЛ';
    display.textContent = `Моргайте! Счет: ${blinkCount} | Время: ${blinkingSeconds}`;

    blinkingTimer = setInterval(() => {
        const currentDisplay = document.getElementById('game-7-timer-display');
        const currentButton = document.getElementById('game-7-blinking').querySelector('button');
        if (!currentDisplay || !currentButton) { clearInterval(blinkingTimer); blinkingTimer = null; return; }

        blinkingSeconds--;
        currentDisplay.textContent = `Моргайте! Счет: ${blinkCount} | Время: ${blinkingSeconds}`;
        
        if (blinkingSeconds <= 0) {
            clearInterval(blinkingTimer);
            currentDisplay.textContent = `Упражнение завершено! Итого морганий: ${blinkCount}`;
            currentButton.textContent = 'СТАРТ СНОВА';
            currentButton.removeEventListener('click', handleBlinkClick);
            currentButton.addEventListener('click', startGameBlinking); 
            blinkingTimer = null; isBlinkingGameActive = false;
        }
    }, 1000);
}


// 8. Аккомодация
function handleAccommodationClick() {
    const status = document.getElementById('game-8-status');
    if (!status) return;
    if (isAccSharp) {
        accScore++;
        status.textContent = `Верно! Счет: ${accScore}. Осталось: ${accommodationSeconds} сек.`;
    } else {
        accScore = Math.max(0, accScore - 1);
        status.textContent = `Мимо! Счет: ${accScore}. Осталось: ${accommodationSeconds} сек.`;
    }
}

function startAccommodationGame() {
    if (accommodationInterval) clearInterval(accommodationInterval);

    const line1 = document.getElementById('acc-line-1');
    const line2 = document.getElementById('acc-line-2');
    const status = document.getElementById('game-8-status');
    const accText = document.getElementById('acc-text');
    if (!line1 || !line2 || !status || !accText) return;

    accommodationSeconds = 20; accScore = 0;
    line1.style.filter = 'none'; line2.style.filter = 'none';
    accText.addEventListener('click', handleAccommodationClick);
    isAccSharp = true;
    status.textContent = `Счет: 0. Осталось: ${accommodationSeconds} сек. Кликайте, когда текст четкий!`;

    accommodationInterval = setInterval(() => {
        const currentLine1 = document.getElementById('acc-line-1');
        const currentLine2 = document.getElementById('acc-line-2');
        const currentStatus = document.getElementById('game-8-status');
        const currentAccText = document.getElementById('acc-text');

        if (!currentLine1 || !currentLine2 || !currentStatus || !currentAccText) { clearInterval(accommodationInterval); accommodationInterval = null; return; }

        accommodationSeconds--;

        if (accommodationSeconds <= 0) {
            clearInterval(accommodationInterval);
            currentLine1.style.filter = 'none'; currentLine2.style.filter = 'none';
            currentStatus.textContent = `Упражнение завершено! Финальный счет: ${accScore}`;
            currentAccText.removeEventListener('click', handleAccommodationClick);
            accommodationInterval = null; return;
        }
        
        if (accommodationSeconds % 2 === 0) {
             currentLine1.style.filter = 'blur(2px)'; currentLine2.style.filter = 'blur(2px)';
             isAccSharp = false;
        } else {
             currentLine1.style.filter = 'none'; currentLine2.style.filter = 'none';
             isAccSharp = true;
        }
        currentStatus.textContent = `Счет: ${accScore}. Осталось: ${accommodationSeconds} сек. Кликайте, когда текст четкий!`;
    }, 1000);
}


// 9. Периферийный тест
function startPeripheralGame() {
    if (peripheralInterval) clearInterval(peripheralInterval);
    if (peripheralTimeout) clearTimeout(peripheralTimeout);

    const target = document.getElementById('peripheral-target');
    const status = document.getElementById('game-9-status');
    const button = document.querySelector('#game-9-peripheral button:last-of-type');
    
    if (!target || !status || !button) return;

    peripheralFoundCount = 0; peripheralGameDuration = 30;
    status.textContent = `Смотрите на X. Осталось: ${peripheralGameDuration} сек.`;
    button.disabled = false; target.style.display = 'none'; targetVisible = false;

    peripheralInterval = setInterval(() => {
        if (peripheralGameDuration <= 0) {
            clearInterval(peripheralInterval); clearTimeout(peripheralTimeout);
            target.style.display = 'none'; button.disabled = true;
            status.textContent = `Упражнение завершено! Финальный счет: ${peripheralFoundCount}`;
            peripheralInterval = null; return;
        }

        peripheralGameDuration -= 2;

        if (Math.random() > 0.5) {
            targetVisible = true;
            const side = Math.random() > 0.5 ? 'right' : 'left';
            target.style.left = side === 'left' ? '20px' : 'auto';
            target.style.right = side === 'right' ? '20px' : 'auto';

            target.style.display = 'block';
            status.textContent = `X. Ищите! У вас 1.5 сек. Счет: ${peripheralFoundCount}. Осталось: ${peripheralGameDuration}`;

            peripheralTimeout = setTimeout(() => {
                if (targetVisible) {
                    target.style.display = 'none'; targetVisible = false;
                    status.textContent = `X. Пропуск! Счет: ${peripheralFoundCount}. Осталось: ${peripheralGameDuration}`;
                    peripheralTimeout = null;
                }
            }, 1500);

        } else {
            target.style.display = 'none'; targetVisible = false;
            status.textContent = `X. Продолжайте смотреть на центр. Счет: ${peripheralFoundCount}. Осталось: ${peripheralGameDuration}`;
        }
    }, 2000);
}

function peripheralFound() {
    const status = document.getElementById('game-9-status');
    const target = document.getElementById('peripheral-target');

    if (!status || !target) return;

    if (targetVisible) {
        peripheralFoundCount++;
        status.textContent = `ВЕРНО! Счет: ${peripheralFoundCount}. Осталось: ${peripheralGameDuration}`;
        target.style.display = 'none'; targetVisible = false;
        clearTimeout(peripheralTimeout); 
        peripheralTimeout = null;
    } else {
        peripheralFoundCount = Math.max(0, peripheralFoundCount - 1);
        status.textContent = `НЕВЕРНО. Сейчас ничего не было. Счет: ${peripheralFoundCount}. Осталось: ${peripheralGameDuration}`;
    }
}


// 10. Сетка Адамаса
function handleAdamasClick() {
    const display = document.getElementById('game-10-timer-display');
    if (!display || !adamasTimer) return;
    
    adamasLineScore++;
    display.textContent = `Линии: ${adamasLineScore} | Время: ${adamasSeconds}`;
}

function startAdamasGame() {
    if (adamasTimer) clearInterval(adamasTimer);
    const grid = document.getElementById('adamas-grid');
    const display = document.getElementById('game-10-timer-display');
    if (!grid || !display) return;

    adamasSeconds = 45;
    adamasLineScore = 0;
    
    grid.addEventListener('click', handleAdamasClick);
    display.textContent = `Линии: ${adamasLineScore} | Время: ${adamasSeconds}`;
    
    adamasTimer = setInterval(() => {
        const currentDisplay = document.getElementById('game-10-timer-display');
        const currentGrid = document.getElementById('adamas-grid');
        if (!currentDisplay || !currentGrid) { clearInterval(adamasTimer); adamasTimer = null; return; }

        adamasSeconds--;

        if (adamasSeconds <= 0) {
            clearInterval(adamasTimer);
            currentDisplay.textContent = `Упражнение завершено! Всего линий: ${adamasLineScore}`;
            currentGrid.removeEventListener('click', handleAdamasClick);
            adamasTimer = null;
            return;
        }

        currentDisplay.textContent = `Линии: ${adamasLineScore} | Время: ${adamasSeconds}`;
    }, 1000);
}

// --- ИНИЦИАЛИЗАЦИЯ ---
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'dark-theme';
    setTheme(savedTheme);
    showSection('main-menu');
});