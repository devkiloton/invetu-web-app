import { ApexOptions } from 'apexcharts';

export const EVOLUTION_CHART_OPTIONS = (
  datesISO: Array<string>,
): ApexOptions => ({
  chart: {
    height: 350,
    type: 'area',

    toolbar: {
      show: false,
      //   tools: {
      //     zoom: false,
      //     pan: false,
      //     reset: false,
      //     zoomin: false,
      //     zoomout: false,
      //     download: false,
      //   },
    },
    locales: [
      {
        name: 'pt-BR',
        options: {
          months: [
            'Janeiro',
            'Fevereiro',
            'Março',
            'Abril',
            'Maio',
            'Junho',
            'Julho',
            'Agosto',
            'Setembro',
            'Outubro',
            'Novembro',
            'Dezemnbro',
          ],
          shortMonths: [
            'Jan',
            'Fev',
            'Mar',
            'Abr',
            'Mai',
            'Jun',
            'Jul',
            'Ago',
            'Set',
            'Out',
            'Nov',
            'Dez',
          ],
          days: [
            'Domingo',
            'Segunda',
            'Terça',
            'Quarta',
            'Quinta',
            'Sexta',
            'Sábado',
          ],
          shortDays: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
          toolbar: {
            exportToSVG: 'Baixar SVG',
            exportToPNG: 'Baixar PNG',
            exportToCSV: 'Baixar CSV',
            selection: 'Seleção',
            selectionZoom: 'Seleção de Zoom',
            zoomIn: 'Zoom In',
            zoomOut: 'Zoom Out',
            pan: 'Panning',
            reset: 'Resetar Zoom',
          },
        },
      },
    ],
    defaultLocale: 'pt-BR',
  },
  dataLabels: {
    enabled: false,
  },
  grid: {
    borderColor: '#4093ff4b',
    padding: { left: -5, right: 0, top: 0, bottom: 0 },
  },
  legend: {
    show: false,
  },
  stroke: {
    curve: 'smooth',
  },
  xaxis: {
    type: 'datetime',
    axisBorder: {
      color: 'transparent',
    },
    categories: datesISO,
    labels: {
      style: {
        cssClass: 'fill-base-content',
      },
    },
  },
  yaxis: {
    labels: {
      offsetX: -15,
      style: {
        cssClass: 'fill-base-content',
      },
      formatter: (value: number) =>
        new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(value),
    },
  },
  tooltip: {
    cssClass: 'text-gray-500',

    x: {
      format: 'dd/MM/yy',
    },
  },
});
