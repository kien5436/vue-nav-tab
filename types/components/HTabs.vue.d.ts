declare const _default: import("vue").DefineComponent<{
    appearance: {
        default: string;
        type: StringConstructor;
        validator: (val: string) => boolean;
    };
    group: {
        required: true;
        type: StringConstructor;
    };
    position: {
        default: string;
        type: StringConstructor;
        validator: (val: string) => boolean;
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
    classes: import("vue").ComputedRef<{
        "vp-border-b-gray-300 vp-border-b": boolean;
        "vp-border-t-gray-300 vp-border-t": boolean;
        "vp-pills": boolean;
        "vp-tabs vp-border-solid": boolean;
        "vp-tabs-bottom": boolean;
    }>;
    contextMenu: any;
    onMenuClick: (actionId: string) => void;
    showContextMenu: (e: MouseEvent, tabId: string) => void;
}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    appearance: {
        default: string;
        type: StringConstructor;
        validator: (val: string) => boolean;
    };
    group: {
        required: true;
        type: StringConstructor;
    };
    position: {
        default: string;
        type: StringConstructor;
        validator: (val: string) => boolean;
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
    appearance: string;
    position: string;
    rounded: boolean;
}>;
export default _default;
