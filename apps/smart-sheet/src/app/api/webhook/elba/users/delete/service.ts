import { inngest } from '@/inngest/client';

export const deleteUserRequest = async ({
  id,
  organisationId,
  region,
}: {
  id: string;
  organisationId: string;
  region: string;
}) => {
  await inngest.send({
    name: 'smart-sheet/users.delete.requested',
    data: {
      id,
      organisationId,
      region,
    },
  });
};
