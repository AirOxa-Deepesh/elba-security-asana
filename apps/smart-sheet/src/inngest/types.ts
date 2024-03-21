export type InngestEvents = {
  'smart-sheet/users.page_sync.requested': {
    data: {
      organisationId: string;
      region: string;
      isFirstSync: boolean;
      syncStartedAt: number;
      page: number;
    };
  };
  'smart-sheet/smart-sheet.token.refresh.requested': {
    data: {
      organisationId: string;
      refreshToken?: string;
      region?: string;
      expiresAt: number;
    };
  };
  'smart-sheet/users.delete.requested': {
    data: {
      id: string;
      organisationId: string;
      region: string;
    };
  };
};
