declare const _default: import("vue").DefineComponent<{
    group: {
        required: true;
        type: StringConstructor;
    };
    rounded: {
        default: boolean;
        type: BooleanConstructor;
    };
    tabs: {
        required: true;
        type: ArrayConstructor;
    };
}, {
    actions: {
        id: string;
        text: string;
    }[];
    contextMenu: any;
    onMenuClick: (actionId: string) => void;
    showContextMenu: (e: MouseEvent, tabId: string) => void;
}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    group: {
        required: true;
        type: StringConstructor;
    };
    rounded: {
        default: boolean;
        type: BooleanConstructor;
    };
    tabs: {
        required: true;
        type: ArrayConstructor;
    };
}>>, {
    rounded: boolean;
}>;
export default _default;
