declare const _default: import("vue").DefineComponent<{
    active: {
        default: boolean;
        type: BooleanConstructor;
    };
    closable: {
        default: boolean;
        type: BooleanConstructor;
    };
    direction: {
        required: true;
        type: StringConstructor;
        validator: (val: string) => boolean;
    };
    group: {
        required: true;
        type: StringConstructor;
    };
    rounded: {
        default: boolean;
        type: BooleanConstructor;
    };
    tabId: {
        required: true;
        type: StringConstructor;
    };
}, {
    activateTab: () => void;
    classes: import("vue").ComputedRef<{
        "vp-item-active": boolean;
        "vp-pr-4 vp-justify-center": boolean;
        "vp-pr-8 vp-justify-start": boolean;
        "vp-rounded": boolean;
        "vp-rounded-b": boolean;
        "vp-rounded-t": boolean;
        "vp-text-gray-100 !vp-text-gray-500 !vp-bg-gray-100 vp-pointer-events-none": boolean;
    }>;
    closeTab: () => void;
    computedTabId: import("vue").ComputedRef<string>;
}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("changed" | "close")[], "changed" | "close", import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    active: {
        default: boolean;
        type: BooleanConstructor;
    };
    closable: {
        default: boolean;
        type: BooleanConstructor;
    };
    direction: {
        required: true;
        type: StringConstructor;
        validator: (val: string) => boolean;
    };
    group: {
        required: true;
        type: StringConstructor;
    };
    rounded: {
        default: boolean;
        type: BooleanConstructor;
    };
    tabId: {
        required: true;
        type: StringConstructor;
    };
}>> & {
    onChanged?: ((...args: any[]) => any) | undefined;
    onClose?: ((...args: any[]) => any) | undefined;
}, {
    active: boolean;
    closable: boolean;
    rounded: boolean;
}>;
export default _default;
