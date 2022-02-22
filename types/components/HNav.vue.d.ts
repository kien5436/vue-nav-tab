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
        "vp-border-b-gray-300 vp-border-b": boolean;
        "vp-border-t-gray-300 vp-border-t": boolean;
        "vp-pills": boolean;
        "vp-tabs vp-border-solid": boolean;
        "vp-tabs-bottom": boolean;
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
