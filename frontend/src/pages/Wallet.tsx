import PageContainer from '../components/PageContainer';
import RequestPanel from '../components/RequestPanel';

const Wallet = () => {
  return (
    <PageContainer title="Wallet Explorer" description="Fetch wallet balance and history.">
      <RequestPanel title="Get wallet" method="GET" path="/api/wallet" hideBody />
    </PageContainer>
  );
};

export default Wallet;
