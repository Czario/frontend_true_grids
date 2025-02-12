import { AxisScale } from "@visx/axis";
import { AppleStock } from "@visx/mock-data/lib/mocks/appleStock";

// Type for events (flags)
export interface EventMarker {
    date: Date;
    label?: string;
};

export interface StockDataItem {
    date: string; // or Date if you parse it into a Date object
    close: number;
};


// Type for hover state
export interface HoverPoint {
    x: number;
    y: number;
    date: Date;
    value: number;
};

export interface BrushProps {
    width: number;
    height: number;
    margin?: { top: number; right: number; bottom: number; left: number };
    compact?: boolean;
};

export interface AreaTooltipMarker {
    date: Date;
    value?: number;
};

export interface AreaChartComp {
    data: AppleStock[];
    gradientColor: string;
    xScale: AxisScale<number>;
    yScale: AxisScale<number>;
    width: number;
    yMax: number;
    margin: { top: number; right: number; bottom: number; left: number };
    hideBottomAxis?: boolean;
    hideLeftAxis?: boolean;
    top?: number;
    left?: number;
    children?: React.ReactNode;
    events?: EventMarker[];
    setTooltipData?: (data: EventMarker | null) => void;
    setTooltipLeft?: (left: number | null) => void;
    setTooltipTop?: (top: number | null) => void;
    setTooltipVisible?: (value: boolean | false) => void;
    showHoverLines?: boolean;
    setAreaTooltipData?: (data: AreaTooltipMarker | null) => void;
    setAreaTooltipLeft?: (left: number | null) => void;
    setAreaTooltipTop?: (top: number | null) => void;
    setAreaTooltipVisible?: (value: boolean | false) => void;
}
