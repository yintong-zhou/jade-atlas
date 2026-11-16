export function projectGridLayout(count: number, index: number) {
  const desktopSpan = count % 3 === 1 && index === 0 ? 6 : count % 3 === 2 && index < 2 ? 3 : 2
  return {
    desktopSpan,
    tabletSpan: count % 2 === 1 && index === 0 ? 2 : 1,
    horizontal: desktopSpan === 6,
  }
}
