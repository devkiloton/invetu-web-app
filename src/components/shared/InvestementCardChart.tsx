/* eslint-disable no-undef */
import { ApexOptions } from 'apexcharts';
import React, { useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { INVESTMENT_CARD_CHART_OPTIONS } from '~/constants/investment-card-chart-options';
import { Range } from '~/types/range';

function InvestementCardChart({
  dates,
  prices,
  range,
  currency = 'BRL',
}: {
  dates: string[];
  prices: number[];
  range?: Range;
  currency?: 'BRL' | 'USD';
}) {
  const [options] = useState<ApexOptions>(
    INVESTMENT_CARD_CHART_OPTIONS(dates, range, currency),
  );
  const [series] = useState<ApexAxisChartSeries>([
    {
      name: 'Preço',
      data: prices || [],
    },
  ]);

  return (
    <div id="chart">
      <ReactApexChart
        options={options}
        series={series}
        type="area"
        height={200}
      />
    </div>
  );
}

export default React.memo(InvestementCardChart);
