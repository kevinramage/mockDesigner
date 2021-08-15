export class DictionnaryUtils {
    public static removeElement(key: string, dictionnary: {[key: string]: any}) {
        const newDictionnary : {[key: string]:any} = {};
        Object.entries(dictionnary).forEach(entry => {
            if (entry[0] != key) {
                newDictionnary[entry[0]] = entry[1];
            }
        });
        return newDictionnary;
    }
}