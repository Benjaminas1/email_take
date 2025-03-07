let auth0Client = null;

/**
 * Initializes the Auth0 client
 */
const configureClient = async () => {
  try {
    auth0Client = await auth0.createAuth0Client({
      domain: 'dev-6sbydsally3owfwr.us.auth0.com',
      clientId: 'GYUiAl5rDYNDmKKR4LgeEPoaBk8VHZht',
      cacheLocation: 'localstorage',
      useRefreshTokens: true, // Enable refresh tokens
    });
  } catch (err) {
    console.error("Failed to configure Auth0 client", err);
  }
};

/**
 * Starts the authentication flow and redirects to Auth0 for login.
 */
const login = async () => {
  try {
    console.log("Logging in");

    await auth0Client.loginWithRedirect({
      authorizationParams: {
        redirect_uri: window.location.origin,
        scope: 'openid profile email',
      },
    });
  } catch (err) {
    console.log("Log in failed", err);
  }
};

/**
 * Handles the redirect after login and retrieves the user's email.
 */
const handleRedirectAndGetEmail = async () => {
  try {
    const query = window.location.search;

    // Check if this is a callback from Auth0
    if (query.includes("code=") && query.includes("state=")) {
      try {
        // Handle the redirect callback and extract user information
        await auth0Client.handleRedirectCallback();
        const user = await auth0Client.getUser();
        console.log("User's email after redirect:", user.email);

        // Replace the URL to remove the code and state parameters
        window.history.replaceState({}, document.title, "/");
      } catch (err) {
        console.error("Error handling redirect:", err);
      }
    } else {
      // Check if the user is already authenticated
      const isAuthenticated = await auth0Client.isAuthenticated();

      if (isAuthenticated) {
        const user = await auth0Client.getUser();
        console.log("User's email:", user.email);
      } else {
        // If not authenticated, start the login process
        login();
      }
    }
  } catch (err) {
    console.error("Error during authentication process", err);
  }
};

// Will run when the page finishes loading
window.onload = async () => {
  try {
    await configureClient();
    await handleRedirectAndGetEmail();
  } catch (err) {
    console.error("Error during initialization", err);
  }
};
