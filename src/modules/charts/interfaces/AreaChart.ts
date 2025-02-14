import { AxisScale } from "@visx/axis";
import { AppleStock } from "@visx/mock-data/lib/mocks/appleStock";

// Type for events (flags)
export interface EventMarker {
    date: Date;
    label?: string;
};

// Event Tooltip marker
export interface EventTooltipMarker {
    date: Date;
    label?: string;
    isHoveredOnLeft: boolean
    left: number
    top: number
};

export interface StockDataItem {
    date: string;
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
    isHoveredOnLeft: boolean
    left: number
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
    showHoverLines?: boolean;
    setTooltipData?: (data: EventTooltipMarker | null) => void;
    setTooltipVisible?: (value: boolean | false) => void;
    setAreaTooltipData?: (data: AreaTooltipMarker | null) => void;
}