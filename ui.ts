function assure<T extends new (...args: any[]) => any>(a: any, b: T): InstanceType<T> {
    if (a instanceof b) return a;
    throw new TypeError(`${a} is not ${b.name}.`);
}

let solver: Solver;
let input_row: HTMLTableRowElement;
let enter_button: HTMLButtonElement;
let reset_button: HTMLButtonElement;
let autoplay_switch: HTMLInputElement;

let autoplay: boolean;
let auto_answer: string;
let timeoutID: number;

addEventListener("load", () => {
    input_row = assure(document.getElementById("input_row"), HTMLTableRowElement);
    enter_button = assure(document.getElementById("enter"), HTMLButtonElement);
    reset_button = assure(document.getElementById("reset"), HTMLButtonElement);
    autoplay_switch = assure(document.getElementById("autoplay"), HTMLInputElement);

    enter_button.disabled = true;
    enter_button.addEventListener("click", enter);
    reset_button.addEventListener("click", reset);
    autoplay_switch.addEventListener("click", clickAutoplay);

    for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++)
        assure(document.getElementById("result" + i + "_" + j), HTMLInputElement).onchange = () => changeRadio(i);
    for (let i = 0; i < 5; i++)
        assure(document.getElementById("guess" + i), HTMLInputElement).onchange = changeGuess;

    reset();
});

function reset() {
    const tbody = input_row.parentElement as HTMLTableSectionElement;
    Array.from(tbody.children).forEach(element => {
        if (element !== input_row) tbody.removeChild(element);
    });
    solver = new Solver();

    input_row.style.display = "";
    enter_button.style.display = "block";
    reset_button.style.display = "none";
    next();
}

function next() {
    const guess = solver.guess();

    for (let pos = 0; pos < 5; pos++) {
        assure(document.getElementById("guess" + pos), HTMLInputElement).value = guess[pos];
    }
}

function changeGuess() {
    enter_button.disabled = getInputedGuess() == null || getInputedResult() == null;
}
function changeRadio(pos: number) {
    assure(document.getElementById("input_cell" + pos), HTMLTableCellElement).className = "";
    enter_button.disabled = getInputedGuess() == null || getInputedResult() == null;
}

function getInputedGuess(): string | null {
    const guess = [0, 1, 2, 3, 4].map(pos => assure(document.getElementById("guess" + pos), HTMLInputElement).value).join("").toLowerCase();

    if (/^[a-z]{5}$/.test(guess)) return guess;
    else return null;
}
function getInputedResult(): letter_result[] | null {
    const result: letter_result[] = [0, 0, 0, 0, 0];
    for (let pos = 0; pos < 5; pos++) {
        let elements = document.getElementsByName("result" + pos) as NodeListOf<HTMLInputElement>;
        let value: undefined | letter_result;
        for (let i = 0; i < elements.length; i++)
            if (elements[i].checked)
                value = parseInt(elements[i].value) as 0 | 1 | 2;
        if (value == undefined) return null;
        else result[pos] = value;
    }
    return result;
}

function clickAutoplay() {
    if (autoplay_switch.checked) {
        autoplay = true;
        auto_answer = solver.possible_answers[Math.floor(solver.possible_answers.length * Math.random())];
        enter_button.style.display = "none";
        reset_button.style.display = "none";
        input_row.style.display = "none";
        //result = wordle(auto_answer, guess);
        autoplayLoop();
    }
    else {
        autoplay = false;
        clearTimeout(timeoutID);
        reset();
    }
}

function autoplayLoop() {
    const guess = solver.guess();
    const result = wordle(auto_answer, guess);
    solver.update(guess, result);

    // 自動計算のguessとresultを確定したものとして前の行に追加
    const tr = document.createElement("tr");
    for (let pos = 0; pos < 5; pos++) {
        const td = document.createElement("td");
        td.innerHTML = `<div class="letter">${guess[pos]}</div>`;
        td.className = ["absent", "present", "correct"][result[pos]];
        tr.appendChild(td);
    }
    input_row.parentElement?.insertBefore(tr, input_row);

    if (guess == auto_answer) {
        if(autoplay) timeoutID = setTimeout(() => {
            const tbody = input_row.parentElement as HTMLTableSectionElement;
            Array.from(tbody.children).forEach(element => {
                if (element !== input_row) tbody.removeChild(element);
            });
            solver = new Solver();

            auto_answer = answers[Math.floor(Math.random() * answers.length)];
            autoplayLoop();
        }, 2000);
    }
    else {
        if(autoplay) timeoutID = setTimeout(autoplayLoop, 500);
    }
}

function enter() {
    // 入力を得てsolverを更新
    const guess = getInputedGuess();
    const result = getInputedResult();
    if (guess == null || result == null) return;
    solver.update(guess, result);

    // 入力されたguessとresultを確定したものとして前の行に追加
    const tr = document.createElement("tr");
    for (let pos = 0; pos < 5; pos++) {
        const td = document.createElement("td");
        td.innerHTML = `<div class="letter">${guess[pos]}</div>`;
        td.className = ["absent", "present", "correct"][result[pos]];
        tr.appendChild(td);
    }
    input_row.parentElement?.insertBefore(tr, input_row);

    // input_row を初期化
    for (let pos = 0; pos < 5; pos++) {
        assure(document.getElementById("input_cell" + pos), HTMLTableCellElement).className = "blank";
        document.getElementsByName("result" + pos).forEach(x => assure(x, HTMLInputElement).checked = false);
    }
    enter_button.disabled = true;

    input_row.style.display = "none";
    if (result.join() == "2,2,2,2,2") {
        enter_button.style.display = "none";
        reset_button.style.display = "block";
    }
    else if (solver.possible_answers.length == 0) {
        alert("No matching answer in the word list. Sorry.");
        enter_button.style.display = "none";
        reset_button.style.display = "block";
    }
    else {
        next();
        setTimeout(() => input_row.style.display = "", 1000);
    }
}