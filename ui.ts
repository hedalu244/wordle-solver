function assure<T extends new (...args: any[]) => any>(a: any, b: T): InstanceType<T> {
    if (a instanceof b) return a;
    throw new TypeError(`${a} is not ${b.name}.`);
}

let solver: Solver;
let guess: string;
let input_row: HTMLTableRowElement;
let result: letter_result[];
let enter_button: HTMLButtonElement;

addEventListener("load", () => {
    reset();
    input_row = assure(document.getElementById("input_row"), HTMLTableRowElement);
    enter_button = assure(document.getElementById("enter"), HTMLButtonElement);

    enter_button.disabled = true;
    enter_button.addEventListener("click", enter);

    Array.from(document.getElementsByTagName("input")).forEach(x => { if (x.type == "radio") x.onclick = clickRadio; });
});

function reset() {
    solver = new Solver();
    next();
}

function next() {
    guess = solver.guess();

    for (let i = 0; i < 5; i++) {
        assure(document.getElementById("guess" + i), HTMLDivElement).innerText = guess[i];
    }
}

function clickRadio(event: MouseEvent) {
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

function enter() {
    for (let pos = 0; pos < 5; pos++) {
        assure(document.getElementById("input_cell" + pos), HTMLTableCellElement).className = "";
        document.getElementsByName("result" + pos).forEach(x => assure(x, HTMLInputElement).checked = false);
    }
    const tr = document.createElement("tr");
    for (let pos = 0; pos < 5; pos++) {
        const td = document.createElement("td");
        td.innerHTML = `<div class="letter">${guess[pos]}</div>`;
        td.className = ["absent", "present", "correct"][result[pos]];
        tr.appendChild(td);
    }

    input_row.parentElement?.insertBefore(tr, input_row);

    solver.update(guess, result);
    if (solver.possible_answers.length == 0) alert("No matching answer in the word list. Sorry.")
    if (result.join() != "2,2,2,2,2") next();
}