// QA PACK 1 — frontend/pages/minhas-ordens.js
// No mapping:
precoExecutadoMedio:
  o.precoExecutadoMedio == null ? null : Number(o.precoExecutadoMedio),

// Desktop, após Preço limite:
<th>Preço executado</th>

// célula:
<td>
  <ValorOrdem>
    {x.precoExecutadoMedio == null ? '—' : formatTS(x.precoExecutadoMedio)}
  </ValorOrdem>
</td>

// Mobile, após Preço limite:
<InfoBloco>
  <span>Preço executado</span>
  <strong>
    {x.precoExecutadoMedio == null ? '—' : formatTS(x.precoExecutadoMedio)}
  </strong>
</InfoBloco>
