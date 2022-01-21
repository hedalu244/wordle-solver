type letter_result = 0 | 1 | 2;

function wordle(answer: string, guess: string): letter_result[] {
    const answer_letters = Array.from(answer);
    return Array.from(guess).map((guess_letter, pos) => {
        if (answer_letters[pos] == guess_letter) return 2;
        if (answer_letters.includes(guess_letter)) return 1;
        return 0;
    });
}

type Letter = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z";
const letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"] as const;

class Solver {
    // どこで使われうるか。主に黄色と灰色で更新。0x11111でも0x00000でもない⇒どこかで必ず使われている
    letter_conditions: {
        "a": number, "b": number, "c": number, "d": number, "e": number, "f": number, "g": number, "h": number, "i": number, "j": number, "k": number, "l": number, "m": number, "n": number, "o": number, "p": number, "q": number, "r": number, "s": number, "t": number, "u": number, "v": number, "w": number, "x": number, "y": number, "z": number,
    };
    // 確定した文字。主に緑で更新
    word_condition: (Letter | "*")[];

    constructor() {
        this.letter_conditions = {} as typeof this.letter_conditions;
        letters.forEach(l => this.letter_conditions[l] = 0b11111);
        this.word_condition = ["*", "*", "*", "*", "*",];
    }

    // 結果をもとに情報を更新
    update(guess: string, result: letter_result[]) {
        const guess_letters = Array.from(guess) as Letter[];

        for (let pos = 0; pos < 5; pos++) {
            // 結果が灰色ならそれが使われていないことが確定
            if (result[pos] == 0)
                this.letter_conditions[guess_letters[pos]] = 0b00000;
            // 結果が黄色ならどこかで使われていて、かつ、その場所で使われていないことが確定
            if (result[pos] == 1) {
                this.letter_conditions[guess_letters[pos]] &= [0b01111, 0b10111, 0b11011, 0b11101, 0b11110][pos];
                // それによってあり得る位置が1か所になったら文字確定
                if (this.letter_conditions[guess_letters[pos]] == 0b10000) this.word_condition[0] = guess_letters[pos];
                if (this.letter_conditions[guess_letters[pos]] == 0b01000) this.word_condition[1] = guess_letters[pos];
                if (this.letter_conditions[guess_letters[pos]] == 0b00100) this.word_condition[2] = guess_letters[pos];
                if (this.letter_conditions[guess_letters[pos]] == 0b00010) this.word_condition[3] = guess_letters[pos];
                if (this.letter_conditions[guess_letters[pos]] == 0b00001) this.word_condition[4] = guess_letters[pos];
                // ある場所についてあり得る文字が1通りに絞られることで確定する場合もあるが、高々6ラウンドでは無さげなので省略
            }
            // 結果が緑なら文字確定
            if (result[pos] == 2)
                this.word_condition[pos] = guess_letters[pos];
        }
    }

    // 候補が条件に合うか
    match(option: string): boolean {
        const option_letters = Array.from(option) as Letter[];
        return (this.letter_conditions[option_letters[0]] & 0b10000) !== 0 &&
            (this.letter_conditions[option_letters[1]] & 0b01000) !== 0 &&
            (this.letter_conditions[option_letters[2]] & 0b00100) !== 0 &&
            (this.letter_conditions[option_letters[3]] & 0b10000) !== 0 &&
            (this.letter_conditions[option_letters[4]] & 0b10000) !== 0 &&
            (this.word_condition[0] == "*" || this.word_condition[0] == this.word_condition[0]) &&
            (this.word_condition[1] == "*" || this.word_condition[1] == this.word_condition[1]) &&
            (this.word_condition[2] == "*" || this.word_condition[2] == this.word_condition[2]) &&
            (this.word_condition[3] == "*" || this.word_condition[3] == this.word_condition[3]) &&
            (this.word_condition[4] == "*" || this.word_condition[4] == this.word_condition[4]);
    }
}