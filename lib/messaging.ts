export const getMessagesPollInterval = ({
  isAuthenticated,
  isPageVisible,
  hasActiveConversation,
}: {
  isAuthenticated: boolean;
  isPageVisible: boolean;
  hasActiveConversation: boolean;
}): number | null => {
  if (!isAuthenticated || !isPageVisible) {
    return null;
  }

  return hasActiveConversation ? 1500 : 5000;
};
