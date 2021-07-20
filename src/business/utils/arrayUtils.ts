export class ArrayUtils {

    public static removeElement(array: Array<any>, element: any) {
        let result : Array<any> = [];
        for (var index in array) {
            const elt = array[index];
            if (elt != element) {
                result.push(elt);
            }
        }
        return result;
    }
}