type JsonViewerProps = {
  data: unknown;
};

const JsonViewer = ({ data }: JsonViewerProps) => {
  return <pre className="json-viewer">{JSON.stringify(data, null, 2)}</pre>;
};

export default JsonViewer;
