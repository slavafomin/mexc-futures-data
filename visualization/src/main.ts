
import './style.css';

import {
  AreaSeries,
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  SeriesMarker,
  Time,
  createChart,
  createSeriesMarkers,

} from 'lightweight-charts';

import dump from '../../data.json';


const primaryColor = 'rgba(249, 213, 83, 1)';

const incidentTime1 = 1739416500;
const incidentTime2 = 1739418660;

const MINUTE_S = 60;
const HOUR_S = MINUTE_S * 60;


(() => {

  //==================//
  // DATA PREPARATION //
  //==================//

  const candlesData: any = [];
  const candlesRealData: any = [];
  const volumeData: any = [];

  const dataPointsCount = dump.data.open.length;

  for (let i = 0; i < dataPointsCount; i++) {

    candlesData.push({
      open: dump.data.open[i],
      high: dump.data.high[i],
      low: dump.data.low[i],
      close: dump.data.close[i],
      time: dump.data.time[i],
    });

    candlesRealData.push({
      open: dump.data.realOpen[i],
      high: dump.data.realHigh[i],
      low: dump.data.realLow[i],
      close: dump.data.realClose[i],
      time: dump.data.time[i],
    });

    volumeData.push({
      value: dump.data.vol[i],
      time: dump.data.time[i],
    });

  }


  //=========//
  // CHART 1 //
  //=========//

  let element = (
    document.querySelector<HTMLDivElement>('#chart-1')
  );

  if (element) {
    initChart({
      container: element,
      candlesData: candlesRealData,
      volumeData,
      legend: 'THE/USDT ("REAL")',
    });
  }


  //=========//
  // CHART 2 //
  //=========//

  element = (
    document.querySelector<HTMLDivElement>('#chart-2')
  );

  if (element) {
    initChart({
      container: element,
      candlesData,
      volumeData,
      legend: 'THE/USDT',
    });
  }

})();


function initChart(args: {
  container: HTMLElement;
  candlesData: any[];
  volumeData: any[];
  legend: string;

}): void {

  const { container } = args;

  container.innerHTML = `
    <div class="legend">${args.legend}</div>
  `;

  //=======//
  // CHART //
  //=======//

  const chart = createChart(container, {
    layout: {
      textColor: 'white',
      background: {
        type: ColorType.Solid,
        color: 'black',
      },
    },
    rightPriceScale: {
      textColor: 'white',
      borderColor: primaryColor,
    },
    grid: {
      vertLines: { color: '#111' },
      horzLines: { color: '#111' },
    },
    crosshair: {
      mode: CrosshairMode.Normal,
      vertLine: {
        color: 'rgba(249, 213, 83, 0.7)',
        labelBackgroundColor: 'rgba(249, 213, 83, 0.8)',
        width: 1,
      },
      horzLine: {
        color: 'rgba(249, 213, 83, 0.7)',
        labelBackgroundColor: 'rgba(249, 213, 83, 0.8)',
        width: 1,
      },
    },
    timeScale: {
      borderColor: '#F9D553',
      timeVisible: true,
    },
  });

  chart.timeScale().fitContent();

  window.addEventListener('resize', () => {
    chart.resize(window.innerWidth, window.innerHeight);
  });


  //=========//
  // CANDLES //
  //=========//

  const candlestickSeries = chart.addSeries(CandlestickSeries, {
    wickUpColor: '#00E979',
    upColor: '#00E979',
    wickDownColor: '#E90054',
    downColor: '#E90054',
    borderVisible: false,
    priceFormat: {
      type: 'price',
      precision: 3,
      minMove: 0.001,
    },
    priceLineVisible: false,
  });

  candlestickSeries.priceScale().applyOptions({
    scaleMargins: {
      top: 0.1,
      bottom: 0.6,
      // bottom: 0.4,
    },
  });

  candlestickSeries.setData(args.candlesData);


  //=========//
  // MARKERS //
  //=========//

  const markers: SeriesMarker<Time>[] = [
    {
      time: incidentTime1 as any,
      position: 'aboveBar',
      color: primaryColor,
      shape: 'arrowDown',
      text: 'OPEN',
    },
    {
      time: incidentTime2 as any,
      position: 'aboveBar',
      color: primaryColor,
      shape: 'arrowDown',
      text: 'LIQUIDATION',
    },
  ];

  createSeriesMarkers(candlestickSeries, markers);


  //========//
  // VOLUME //
  //========//

  const volumeSeries = chart.addSeries(HistogramSeries, {
    priceFormat: {
      type: 'volume',
    },
    priceScaleId: '',
    color: primaryColor,
  });

  volumeSeries.priceScale().applyOptions({
    scaleMargins: {
      top: 0.7,
      bottom: 0,
    },
  });

  volumeSeries.setData(args.volumeData);


  //=========//
  // TOOLTIP //
  //=========//

  const toolTipWidth = 140;
  const toolTipHeight = 98;
  const offset = 15;

  const body = document.body;

  const toolTip = document.createElement('div');
  toolTip.className = 'tooltip';
  toolTip.style.width = `${toolTipWidth}px`;
  toolTip.style.height = `${toolTipHeight}px`;
  body.appendChild(toolTip);

  chart.subscribeCrosshairMove(param => {

    const {
      clientX = 0,
      clientY = 0,

    } = param.sourceEvent ?? {};

    const rect = container.getBoundingClientRect();

    const minX = rect.left;
    const maxX = rect.right;

    const minY = rect.top;
    const maxY = rect.bottom;

    if (
      !param.time ||
      (clientX < minX || clientX > maxX) ||
      (clientY < minY || clientY > maxY)
    ) {
      toolTip.style.display = 'none';
    } else {
      toolTip.style.display = 'block';
      const data = param.seriesData.get(candlestickSeries) as any;
      const data2 = param.seriesData.get(volumeSeries) as any;
      const time = new Date(parseInt(String(param.time), 10) * 1000);
      const volume = data2.value.toLocaleString('en-US');
      toolTip.innerHTML = (`
        <div>Time: ${formatDateUtc(time)}</div>
        <div>Open: ${data.open}</div>
        <div>High: ${data.high}</div>
        <div>Low: ${data.low}</div>
        <div>Close: ${data.close}</div>
        <div>Volume: ${volume}</div>
      `);

      let left = (clientX + offset);
      if (left > rect.width - toolTipWidth) {
        left = clientX - offset - toolTipWidth;
      }

      let top = (clientY + offset);
      if (top > rect.top + rect.height - toolTipHeight) {
        top = clientY - toolTipHeight - offset;
      }

      toolTip.style.left = left + 'px';
      toolTip.style.top = top + 'px';
    }
  });


  //===========//
  // HIGHLIGHT //
  //===========//

  const radius = (5 * MINUTE_S);

  const highlightSeries = chart.addSeries(AreaSeries, {
    priceScaleId: 'unused',
    topColor: 'rgba(255, 0, 0, 0.2)',
    bottomColor: 'rgba(255, 0, 0, 0.2)',
    lineColor: 'transparent',
    lineWidth: 1,
    autoscaleInfoProvider: () => null,
  });

  highlightSeries.setData([
    { time: incidentTime1 - radius as any, value: 1 },
    { time: incidentTime2 + radius as any as any, value: 1 },
  ]);


  //======//
  // ZOOM //
  //======//

  chart.timeScale().setVisibleRange({
    from: (incidentTime1 - HOUR_S) as any,
    to: (incidentTime2 + HOUR_S) as any,
  });



}

function formatDateUtc(date: Date): string {
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // +1 because months are 0-based
  const year = String(date.getUTCFullYear()).slice(-2); // Last 2 digits of year

  return `${day}.${month}.${year} ${hours}:${minutes}`;
}
