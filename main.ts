type letter_result = 0 | 1 | 2;

function wordle(answer: string, guess: string): letter_result[] {
    const answer_letters = Array.from(answer);
    return Array.from(guess).map((guess_letter, pos) => {
        if (answer_letters[pos] == guess_letter) return 2;
        if (answer_letters.includes(guess_letter)) return 1;
        return 0;
    });
}

class Solver {
    guesses: { guess: string, joined_result: string; }[];

    constructor() {
        this.guesses = [];
    }

    // 結果をもとに情報を更新
    update(guess: string, result: letter_result[]) {
        this.guesses.push({ guess, joined_result: result.join() });
    }

    // 候補が条件に合うか
    match(option: string): boolean {
        return this.guesses.every((pair) => wordle(option, pair.guess).join() == pair.joined_result);
    }
}