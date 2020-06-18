export class BusinessObject {

    public static determine(path: string) {
        var businessObject = BusinessObject.determinePathWithID(path);
        if ( businessObject == null ) {
            businessObject = BusinessObject.determineLastPath(path);
        }
        return businessObject;
    }

    private static determinePathWithID(path: string) {
        var businessObject : string | null = null;
        const regex = /\/([a-z|A-Z|0-9]+)(\/{[a-z|A-Z|0-9]+})(.*)/g;
        const match = regex.exec(path);
        if ( match && match.length > 1) {
            businessObject = match[1];
            if ( match.length > 3 ) {
                businessObject += BusinessObject.determinePathWithIdRemaining(match[3]);
            }
        }
        return businessObject;
    }

    private static determinePathWithIdRemaining(path: string) {
        var businessObject = "", match;
        const regex = /\/([a-z|A-Z|0-9]+)/g;
        while ( (match = regex.exec(path))) {
            businessObject += "." + match[1];
        }
        return businessObject;
    }

    private static determineLastPath(path: string) {
        const regex =/\/([a-z|A-Z|0-9]+)\/?$/g;
        const match = regex.exec(path);
        if ( match && match.length > 1) {
            return match[1];
        } else {
            return "";
        }
    }
}