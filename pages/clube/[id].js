// QA PACK 1 — frontend/pages/clube/[id].js
const ChartBody = styled.div`
  position: relative;
  min-height: 330px;
  padding: 0 12px;
  @media (max-width: 700px) {
    min-height: 350px;
    padding: 0;
  }
`;

const ChartViewport = styled.div`
  position: relative;
  width: 100%;
  min-height: 318px;

  svg {
    display: block;
    width: 100%;
    height: auto;
    min-height: 270px;
    touch-action: pan-y;
  }

  @media (max-width: 700px) {
    overflow-x: auto;
    overflow-y: hidden;
    min-height: 338px;
    padding: 0 10px 8px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;

    svg {
      width: 760px;
      max-width: none;
      min-width: 760px;
      height: auto;
      min-height: 0;
    }
  }
`;

// Nos dois <text> do SVG (preços do eixo Y e datas do eixo X),
// alterar fontSize="12" para fontSize="14".
