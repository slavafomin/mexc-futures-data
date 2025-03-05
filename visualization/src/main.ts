
import './style.css';

import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  createChart,

} from 'lightweight-charts';

import dump from '../../data.json';


(() => {

  //==================//
  // DATA PREPARATION //
  //==================//

  const candlesData: any = [];
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

    volumeData.push({
      value: dump.data.vol[i],
      time: dump.data.time[i],
    });

  }

  const rootElement = (
    document.querySelector<HTMLDivElement>('#chart')
  );

  if (!rootElement) {
    return;
  }


  //=======//
  // CHART //
  //=======//

  const chart = createChart(rootElement, {
    layout: {
      textColor: 'white',
      background: {
        type: ColorType.Solid,
        color: 'black',
      },
    },
    rightPriceScale: {
      textColor: 'white',
      borderColor: 'rgba(249, 213, 83, 1)',
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
  });

  chart.timeScale().applyOptions({
    borderColor: '#F9D553',
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
  });

  candlestickSeries.priceScale().applyOptions({
    scaleMargins: {
      top: 0.1,
      bottom: 0.4,
    },
  });

  candlestickSeries.setData(candlesData);


  //========//
  // VOLUME //
  //========//

  const volumeSeries = chart.addSeries(HistogramSeries, {
    priceFormat: {
      type: 'volume',
    },
    priceScaleId: '',
    color: 'rgba(249, 213, 83, 1)',
  });

  volumeSeries.priceScale().applyOptions({
    scaleMargins: {
      top: 0.7,
      bottom: 0,
    },
  });

  volumeSeries.setData(volumeData);


  //=========//
  // TOOLTIP //
  //=========//

  const container = document.body;

  const toolTipWidth = 140;
  const toolTipHeight = 98;
  const toolTipMargin = 15;

  const toolTip = document.createElement('div');
  toolTip.className = 'tooltip';
  toolTip.style.width = `${toolTipWidth}px`;
  toolTip.style.height = `${toolTipHeight}px`;
  document.body.appendChild(toolTip);

  chart.subscribeCrosshairMove(param => {
    if (
      param.point === undefined ||
      !param.time ||
      param.point.x < 0 ||
      param.point.x > container.clientWidth ||
      param.point.y < 0 ||
      param.point.y > container.clientHeight
    ) {
      toolTip.style.display = 'none';
    } else {
      toolTip.style.display = 'block';
      const data = param.seriesData.get(candlestickSeries) as any;
      const data2 = param.seriesData.get(volumeSeries) as any;
      const time = new Date(parseInt(String(param.time), 10) * 1000);
      const volume = data2.value.toLocaleString('en-US');
      toolTip.innerHTML = (`
        <div>Time: ${formatDate(time)}</div>
        <div>Open: ${data.open}</div>
        <div>High: ${data.high}</div>
        <div>Low: ${data.low}</div>
        <div>Close: ${data.close}</div>
        <div>Volume: ${volume}</div>
      `);

      const y = param.point.y;
      let left = param.point.x + toolTipMargin;
      if (left > container.clientWidth - toolTipWidth) {
        left = param.point.x - toolTipMargin - toolTipWidth;
      }

      let top = y + toolTipMargin;
      if (top > container.clientHeight - toolTipHeight) {
        top = y - toolTipHeight - toolTipMargin;
      }

      toolTip.style.left = left + 'px';
      toolTip.style.top = top + 'px';
    }
  });


})();


function formatDate(date: Date): string {

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // +1 because months are 0-based
  const year = String(date.getFullYear()).slice(-2); // Last 2 digits of year

  return `${hours}:${minutes} ${day}.${month}.${year}`;

}
