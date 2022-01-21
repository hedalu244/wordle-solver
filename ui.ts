function assure<T extends new (...args: any[]) => any>(a: any, b: T): InstanceType<T> {
    if (a instanceof b) return a;
    throw new TypeError(`${a} is not ${b.name}.`);
}

let solver: Solver;
let guess: string;
let input_row: HTMLTableRowElement;
let result: letter_result[];
let enter_button: HTMLButtonElement;
let reset_button: HTMLButtonElement;
let autoplay_switch: HTMLInputElement;

let autoplay: boolean;
let auto_answer: string;

addEventListener("load", () => {
    input_row = assure(document.getElementById("input_row"), HTMLTableRowElement);
    enter_button = assure(document.getElementById("enter"), HTMLButtonElement);
    reset_button = assure(document.getElementById("reset"), HTMLButtonElement);
    autoplay_switch = assure(document.getElementById("autoplay"), HTMLInputElement);

    enter_button.disabled = true;
    enter_button.addEventListener("click", enter);
    reset_button.addEventListener("click", reset);
    autoplay_switch.addEventListener("click", clickAutoplay);

    Array.from(document.getElementsByTagName("input")).forEach(x => { if (x.type == "radio") x.onclick = clickRadio; });

    reset();
});

function reset() {
    const tbody = input_row.parentElement as HTMLTableSectionElement;
    Array.from(tbody.children).forEach(element => {
        if (element !== input_row) tbody.removeChild(element);
    });
    solver = new Solver();

    if (autoplay) {
        auto_answer = answers[Math.floor(answers.length * Math.random())];
        next();
    }
    else {
        input_row.style.display = "table-row";
        enter_button.style.display = "block";
        reset_button.style.display = "none";
        next();
    }
}

function next() {
    guess = solver.guess();

    for (let i = 0; i < 5; i++) {
        assure(document.getElementById("guess" + i), HTMLDivElement).innerText = guess[i];
    }

    if(autoplay) autoEnter();
}

function clickRadio() {
    enter_button.disabled = false;
    result = [0, 1, 2, 3, 4].map(pos => {
        var elements = document.getElementsByName("result" + pos) as NodeListOf<HTMLInputElement>;
        // 選択状態の値を取得
        for (let i = 0; i < elements.length; i++) {
            if (elements[i].checked) {
                assure(document.getElementById("input_cell" + pos), HTMLTableCellElement).className = ["absent", "present", "correct"][parseInt(elements[i].value)];
                return parseInt(elements[i].value) as 0 | 1 | 2;
            }
        }
        enter_button.disabled = true;
        return 0;
    });
}

function clickAutoplay() {
    if (autoplay_switch.checked) {
        auto_answer = solver.possible_answers[Math.floor(solver.possible_answers.length * Math.random())];
        enter_button.style.display = "none";
        reset_button.style.display = "none";
        input_row.style.display = "none";
        autoplay = true;
        autoEnter();
    }
    else {
        reset();
        autoplay = false;
    }
}

function autoEnter() {
    result = wordle(auto_answer, guess);
    enter();
}

function enter() {
    for (let pos = 0; pos < 5; pos++) {
        assure(document.getElementById("input_cell" + pos), HTMLTableCellElement).className = "";
        document.getElementsByName("result" + pos).forEach(x => assure(x, HTMLInputElement).checked = false);
    }
    enter_button.disabled = true;
    
    const tr = document.createElement("tr");
    for (let pos = 0; pos < 5; pos++) {
        const td = document.createElement("td");
        td.innerHTML = `<div class="letter">${guess[pos]}</div>`;
        td.className = ["absent", "present", "correct"][result[pos]];
        tr.appendChild(td);
    }

    input_row.parentElement?.insertBefore(tr, input_row);

    solver.update(guess, result);


    if (autoplay) {
        if (result.join() == "2,2,2,2,2") {
            setTimeout(reset, 2000);
        }
        else {
            setTimeout(next, 500);
        }
    }
    else {
        if (result.join() == "2,2,2,2,2") {
            input_row.style.display = "none";
            enter_button.style.display = "none";
            reset_button.style.display = "block";
        }
        else if (solver.possible_answers.length == 0) {
            alert("No matching answer in the word list. Sorry.");
            input_row.style.display = "none";
            enter_button.style.display = "none";
            reset_button.style.display = "block";
        }
        else next();
    }
}