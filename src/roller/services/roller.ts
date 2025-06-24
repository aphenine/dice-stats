export class Roller {
    rollDice (faces: number): number {
        return Math.floor(Math.random() * (faces )) + 1
    }

    rollDiceNTimes (faces: number, times: number): Array<number> {
        return Array(times).fill(null).map(() => this.rollDice(faces));
    }
};

export const rollerService = new Roller();