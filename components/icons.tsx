const shapes: Record<string,string> = {
  home:'M3 10 12 3l9 7v10h-6v-7H9v7H3Z',
  chart:'M4 20V10m6 10V4m6 16v-7m6 7V7M3 20h18',
  star:'m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z',
  wrong:'M5 3h12l3 3v15H5Zm4 6h6m-6 4h6m-6 4h3',
  clock:'M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  settings:'M4 7h16M4 17h16M8 4v6m8 4v6',
  check:'m5 12 4 4L19 6', close:'m6 6 12 12M6 18 18 6',
  arrow:'M4 12h16m-6-6 6 6-6 6',back:'M20 12H4m6-6-6 6 6 6',
};
const Icon = ({name}:{name:string}) => <svg viewBox="0 0 24 24" aria-hidden="true"><path d={shapes[name]||shapes.chart}/></svg>;
export default Icon;
