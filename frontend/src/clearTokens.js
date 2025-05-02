// This script will check existing tokens in localStorage
// It should be imported and executed once when the application starts

export const clearExistingTokens = () => {
  // We no longer automatically clear tokens on refresh
  // This allows users to stay logged in between page refreshes
  console.log('Checking existing tokens in localStorage');

  // Only clear tokens if they're invalid (we could add validation here if needed)
  // For now, we'll keep the token unless it's explicitly logged out
};
