import { useKeycloak } from '@react-keycloak/web';

const Profile = () => {
  const { keycloak, initialized } = useKeycloak();
  if (!initialized) {
    return <div>Loading ...</div>;
  }
  const user = keycloak?.tokenParsed;
  return (
    keycloak?.authenticated &&
    user && (
      <div>
        {user.picture && <img src={user.picture} alt={user.name || user.preferred_username} />}
        <h2>{user.name || user.preferred_username}</h2>
        <p>{user.email}</p>
      </div>
    )
  );
};

export default Profile;
