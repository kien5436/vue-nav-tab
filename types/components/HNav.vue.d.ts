declare const _default: import("vue").DefineComponent<{
    appearance: {
        default: string;
        type: StringConstructor;
        validator: (val: string) => boolean;
    };
    position: {
        default: string;
        type: StringConstructor;
        validator: (val: string) => boolean;
    };
}, {
    classes: import("vue").ComputedRef<{
        "vp-tabs vp-border-solid": boolean;
        "vp-pills": boolean;
        "vp-tabs-bottom": boolean;
        "vp-border-t-gray-300 vp-border-t": boolean;
        "vp-border-b-gray-300 vp-border-b": boolean;
    }>;
}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    appearance: {
        default: string;
        type: StringConstructor;
        validator: (val: string) => boolean;
    };
    position: {
        default: string;
        type: StringConstructor;
        validator: (val: string) => boolean;
    };
}>>, {
    appearance: string;
    position: string;
}>;
export default _default;
