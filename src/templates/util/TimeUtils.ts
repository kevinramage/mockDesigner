export class TimeUtils {

    public static wait(time: number ) {
        return new Promise<void>((resolve) => {
            setTimeout(() => { resolve(); }, time);
        });
    }
}