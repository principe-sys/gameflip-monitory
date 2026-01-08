import { useMemo, useState } from 'react';
import PageContainer from '../components/PageContainer';
import RequestPanel from '../components/RequestPanel';

const Profile = () => {
  const [profileId, setProfileId] = useState('');

  const path = useMemo(() => {
    const trimmed = profileId.trim();
    return trimmed ? `/api/profile?id=${encodeURIComponent(trimmed)}` : '/api/profile';
  }, [profileId]);

  return (
    <PageContainer title="Profile Explorer" description="Fetch profile information.">
      <label className="label">
        Profile ID (optional)
        <input
          className="input"
          value={profileId}
          onChange={(event) => setProfileId(event.target.value)}
          placeholder="me"
        />
      </label>
      <RequestPanel title="Get profile" method="GET" path={path} hideBody />
    </PageContainer>
  );
};

export default Profile;
