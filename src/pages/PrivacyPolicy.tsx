
const PrivacyPolicy = () => {
  return (
    <div style={{ padding: 20, maxWidth: 800, margin: 'auto', fontFamily: 'Roboto, sans-serif' }}>
      <h1>Privacy Policy</h1>
      <p>
        This app, Light Navigation, uses Google AdSense to display ads. Google may collect certain data
        such as cookies, device information, and IP address to serve personalized ads.
      </p>
      <p>
        No personal information is collected directly by this app. You can opt out of personalized ads
        through your Google account settings.
      </p>
      <p>
        For more information about Google’s policies, visit{' '}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
          Google Privacy Policy
        </a>.
      </p>
    </div>
  );
};

export default PrivacyPolicy;
