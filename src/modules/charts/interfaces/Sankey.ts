

export interface NodeDatum {
    name: string;
    label: string;
    x0?: number;
    x1?: number;
    y0?: number;
    y1?: number;
    index?: number;
};

export interface SankeyLink {
    source: string | number;
    target: string | number;
    value: number;
}

export interface SankeyDataType {
    date: string;
    nodes: NodeDatum[];
    links: SankeyLink[];
}
