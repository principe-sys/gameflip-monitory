import JsonViewer from './JsonViewer';

export default function JsonDetails({ title = 'Raw JSON', data }: { title?: string; data: unknown }) {
  return (
    <details className="panel">
      <summary className="details-summary">{title}</summary>
      <JsonViewer data={data} />
    </details>
  );
}
