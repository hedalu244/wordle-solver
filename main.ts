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
    possible_answers: string[];

    constructor() {
        this.possible_answers = [...answers];
    }

    // 結果をもとに候補を絞る
    update(guess: string, result: letter_result[]) {
        this.possible_answers = this.possible_answers.filter(answer => wordle(answer, guess).join() == result.join());
    }

    // guessをした時に得られる情報量でスコア付けする
    score(guess: string): number {
        // 返ってくる結果の各確率を求める
        const counts: Map<string, number> = new Map();

        this.possible_answers.forEach(answer => {
            const joined_result = wordle(answer, guess).join();
            counts.set(joined_result, (counts.get(joined_result) || 0) + 1);
        });

        // 得られる情報量の期待値を計算する
        return Array.from(counts.entries()).reduce((sum, pair): number => {
            const p = pair[1] / this.possible_answers.length;
            return sum += -Math.log(p) * p;
        }, 0);
    }

    // 最良の質問を選ぶ
    guess() {
        // 最初の質問は前計算した中からランダムに
        if (this.possible_answers.length == answers.length)
            return first_guess[Math.floor(Math.random() * first_guess.length)];
        // 確定したらそれを言うだけ
        if (this.possible_answers.length == 1)
            return this.possible_answers[0];
        // arrowedの中から最良スコアを持つ単語を返す
        let max = 0;
        let best_guess = arrowed[0];
        arrowed.forEach((guess) => {
            const score = this.score(guess);
            if (max < score || this.possible_answers.includes(guess) && max == score) {
                max = score;
                best_guess = guess;
            }
        });
        return best_guess;
    }
}

function run() {
    const answer = answers[Math.floor(Math.random() * answers.length)];
    console.log(`answer: ${answer}`);

    const solver = new Solver();

    for (let i = 1; ; i++) {
        const guess = solver.guess();
        const result = wordle(answer, guess);

        console.log(`${guess} ${solver.possible_answers.length}\n${result.join("")}`);

        solver.update(guess, result);
        if (result.join() == "2,2,2,2,2") break;;
    }
}