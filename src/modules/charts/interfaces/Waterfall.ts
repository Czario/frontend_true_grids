export type XAccessorType<TDatum> = (datum: TDatum) => string | number;
export type YAccessorType<TDatum> = (datum: TDatum) => number;

export interface WaterfallChartProps<TDatum> {
    width: number;
    height: number;
    data: TDatum[];
    xAccessor: XAccessorType<TDatum>;
    yAccessor: YAccessorType<TDatum>;
    yLabel: string;
}