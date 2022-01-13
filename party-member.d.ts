declare module 'ingsoc-js/party-member' {
    declare class PartyMember {
        id: string;
        watchers: object;
        listeners: object;
        constructor(id: string, watchers: object | undefined, listeners: object | undefined);

        clone: () => void;
    }
}