"use strict";
function wordle(answer, guess) {
    const answer_letters = Array.from(answer);
    return Array.from(guess).map((guess_letter, pos) => {
        if (answer_letters[pos] == guess_letter)
            return 2;
        if (answer_letters.includes(guess_letter))
            return 1;
        return 0;
    });
}
class Solver {
    constructor() {
        this.guesses = [];
    }
    // 結果をもとに情報を更新
    update(guess, result) {
        this.guesses.push({ guess, joined_result: result.join() });
    }
    // 候補が条件に合うか
    match(option) {
        return this.guesses.every((pair) => wordle(option, pair.guess).join() == pair.joined_result);
    }
}
