import { ComputedRef } from "vue";
declare const _default: import("vue").DefineComponent<{
    boundingView: {
        default: null;
        type: StringConstructor;
    };
}, {
    close: () => void;
    el: import("vue").Ref<HTMLElement | null>;
    open: (e: MouseEvent) => void;
    style: ComputedRef<{
        display: string;
        left: string;
        top: string;
        zIndex: number;
    }>;
}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    boundingView: {
        default: null;
        type: StringConstructor;
    };
}>>, {
    boundingView: string;
}>;
export default _default;
