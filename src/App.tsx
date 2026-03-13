const sprint4Items = [
  'Отчет ДДС за месяц с группировкой по статье',
  'P&L за месяц (упрощенный, без transfer)',
  'Plan/Fact за месяц: planned vs factual и delta',
  'Единая tenant-изоляция отчетов по organizationId',
];

export function App() {
  return (
    <main style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: '24px', maxWidth: '900px' }}>
      <h1>Finka — Sprint 4 Reports MVP</h1>
      <p>Добавлен backend-слой отчетности: Cashflow, P&L, Plan/Fact.</p>
      <ul>
        {sprint4Items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </main>
  );
}
