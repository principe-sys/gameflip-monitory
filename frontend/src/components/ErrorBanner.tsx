type ErrorBannerProps = {
  message: string;
};

const ErrorBanner = ({ message }: ErrorBannerProps) => {
  return <div className="error-banner">{message}</div>;
};

export default ErrorBanner;
