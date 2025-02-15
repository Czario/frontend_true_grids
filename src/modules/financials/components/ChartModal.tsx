import React from 'react';
import { Modal, Box, Typography } from '@mui/material';
import { BarGroup } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';

interface ChartModalProps {
  open: boolean;
  onClose: () => void;
  rowData: any;
}

const ChartModal: React.FC<ChartModalProps> = ({ open, onClose, rowData }) => {
  if (!rowData) {
    return null;
  }

  const width = 500;
  const height = 400;
  const margin = { top: 40, right: 30, bottom: 50, left: 40 };

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const data = Object.entries(rowData).map(([key, value]) => ({
    label: key,
    value: Number(value),
  }));

  const xScale = scaleBand<string>({
    domain: data.map(d => d.label),
    padding: 0.2,
  });

  const yScale = scaleLinear<number>({
    domain: [0, Math.max(...data.map(d => d.value))],
  });

  xScale.rangeRound([0, xMax]);
  yScale.range([yMax, 0]);

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ padding: 4, backgroundColor: 'white', margin: 'auto', maxWidth: 600 }}>
        <Typography variant="h6" gutterBottom>
          Bar Chart
        </Typography>
        <svg width={width} height={height}>
          <Group top={margin.top} left={margin.left}>
            <BarGroup
              data={data}
              keys={['value']}
              height={yMax}
              x0={d => d.label}
              x0Scale={xScale}
              x1Scale={scaleBand<string>({ domain: ['value'], padding: 0.1 })}
              yScale={yScale}
              color={() => 'rgba(75, 192, 192, 0.6)'}
            >
              {barGroups =>
                barGroups.map(barGroup => (
                  <Group key={`bar-group-${barGroup.index}`} left={barGroup.x0}>
                    {barGroup.bars.map(bar => (
                      <rect
                        key={`bar-group-bar-${barGroup.index}-${bar.index}`}
                        x={bar.x}
                        y={bar.y}
                        width={bar.width}
                        height={bar.height}
                        fill={bar.color}
                      />
                    ))}
                  </Group>
                ))
              }
            </BarGroup>
            <AxisLeft scale={yScale} />
            <AxisBottom top={yMax} scale={xScale} />
          </Group>
        </svg>
      </Box>
    </Modal>
  );
};

export default ChartModal;