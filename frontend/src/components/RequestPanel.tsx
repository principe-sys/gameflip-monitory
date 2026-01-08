import { useMemo, useState } from 'react';
import JsonViewer from './JsonViewer';
import LoadingSpinner from './LoadingSpinner';
import ErrorBanner from './ErrorBanner';

const API_BASE = import.meta.env.VITE_API_BASE ?? '';

type RequestPanelProps = {
  title: string;
  method: string;
  path: string;
  initialBody?: string;
  hideBody?: boolean;
};

const RequestPanel = ({
  title,
  method,
  path,
  initialBody = '',
  hideBody = false
}: RequestPanelProps) => {
  const [body, setBody] = useState(initialBody);
  const [response, setResponse] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const url = useMemo(() => `${API_BASE}${path}`, [path]);

  const handleSend = async () => {
    setError(null);
    setLoading(true);
    setResponse(null);

    let parsedBody: unknown = undefined;

    if (!hideBody && body.trim().length > 0) {
      try {
        parsedBody = JSON.parse(body);
      } catch (parseError) {
        setLoading(false);
        setError('Invalid JSON body. Please check your input.');
        return;
      }
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: hideBody || method === 'GET' || parsedBody === undefined ? undefined : JSON.stringify(parsedBody)
      });

      const data = await response.json();
      if (!response.ok) {
        setError(`Request failed (${response.status}).`);
      }
      setResponse(data);
    } catch (requestError) {
      setError('Network error. Please check the server and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="request-panel">
      <header className="request-panel__header">
        <div>
          <h2>{title}</h2>
          <p className="request-panel__meta">
            <span className={`badge badge--${method.toLowerCase()}`}>{method}</span>
            <span>{url}</span>
          </p>
        </div>
        <button className="button" onClick={handleSend} disabled={loading}>
          Run request
        </button>
      </header>

      {!hideBody ? (
        <div className="request-panel__body">
          <label className="label" htmlFor={`${title}-body`}>
            Request body (JSON)
          </label>
          <textarea
            id={`${title}-body`}
            className="textarea"
            rows={6}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="{ }"
          />
        </div>
      ) : null}

      <div className="request-panel__response">
        {loading ? <LoadingSpinner /> : null}
        {error ? <ErrorBanner message={error} /> : null}
        {response !== null ? <JsonViewer data={response} /> : null}
      </div>
    </section>
  );
};

export default RequestPanel;
