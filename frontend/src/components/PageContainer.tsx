type PageContainerProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

const PageContainer = ({ title, description, children }: PageContainerProps) => {
  return (
    <section className="page">
      <header className="page__header">
        <h1>{title}</h1>
        {description ? <p className="page__description">{description}</p> : null}
      </header>
      <div className="page__body">{children}</div>
    </section>
  );
};

export default PageContainer;
