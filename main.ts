type letter_result = 0 | 1 | 2;

function wordle(answer: string, guess: string): letter_result[] {
    const answer_letters = Array.from(answer);
    return Array.from(guess).map((guess_letter, pos) => {
        if (answer_letters[pos] == guess_letter) return 2;
        if (answer_letters.includes(guess_letter)) return 1;
        return 0;
    });
}

