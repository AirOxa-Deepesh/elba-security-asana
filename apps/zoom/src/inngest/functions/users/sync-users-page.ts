import type { User } from '@elba-security/sdk';
import { Elba } from '@elba-security/sdk';
import { eq, or } from 'drizzle-orm';
import { NonRetriableError } from 'inngest';
import { type MySaasUser, getUsers } from '@/connectors/users';
import { db } from '@/database/client';
import { Organisation } from '@/database/schema';
import { env } from '@/env';
import { inngest } from '@/inngest/client';

const formatElbaUser = (user: MySaasUser): User => ({
  id: user.id,
  displayName: user.display_name,
  email: user.email,
  additionalEmails: [],
});

/**
 * DISCLAIMER:
 * This function, `syncUsersPage`, is provided as an illustrative example and is not a working implementation.
 * It is intended to demonstrate a conceptual approach for syncing users in a SaaS integration context.
 * Developers should note that each SaaS integration may require a unique implementation, tailored to its specific requirements and API interactions.
 * This example should not be used as-is in production environments and should not be taken for granted as a one-size-fits-all solution.
 * It's essential to adapt and modify this logic to fit the specific needs and constraints of the SaaS platform you are integrating with.
 */
export const syncUsersPage = inngest.createFunction(
  {
    id: 'sync-users-page',
    priority: {
      run: 'event.data.isFirstSync ? 600 : 0',
    },
    concurrency: {
      key: 'event.data.organisationId',
      limit: 1,
    },
    retries: 1,
    onFailure: async ({ error, event, step }) => {
      console.log('🚀 ~ file: sync-users-page.ts:38 ~ onFailure: ~ error:', error.message);
      console.log('🚀 ~ file: sync-users-page.ts:38 ~ onFailure: ~ error:', error.name);

      console.log('🚀 ~ file: sync-users-page.ts:38 ~ onFailure: ~ error:', error.stack);

      // This is the failure handler which can be used to
      // send an alert, notification, or whatever you need to do
    },
  },

  { event: 'zoom/users.page_sync.requested' },
  async ({ event, step, logger }) => {
    const { organisationId, syncStartedAt, page, region } = event.data;

    const elba = new Elba({
      organisationId,
      sourceId: env.ELBA_SOURCE_ID,
      apiKey: env.ELBA_API_KEY,
      baseUrl: env.ELBA_API_BASE_URL,
      region,
    });

    const token = await step.run('get-token', async () => {
      const [organisation] = await db
        .select({ token: Organisation.accessToken })
        .from(Organisation)
        .where(eq(Organisation.id, organisationId));

      if (!organisation) {
        throw new NonRetriableError(`Could not retrieve organisation with id=${organisationId}`);
      }
      console.log('🚀 ~ file: sync-users-page.ts:55 ~ token ~ organisation:', organisation);

      return organisation.token;
    });
    console.log('🚀 ~ file: sync-users-page.ts:63 ~ const{token}=awaitstep.run ~ token:', token);

    // retrieve the SaaS organisation token

    const nextPage = await step.run('list-users', async () => {
      // retrieve this users page
      console.log('Get user Before hit');
      const result = await getUsers(token, page);
      // format each SaaS users to elba users
      // const users = result.users.map(formatElbaUser);
      // // send the batch of users to elba
      // await elba.users.update({ users });

      // return result.nextPage;
    });

    // if there is a next page enqueue a new sync user event
    if (nextPage) {
      await step.sendEvent('sync-users-page', {
        name: 'zoom/users.page_sync.requested',
        data: {
          ...event.data,
          page: nextPage,
        },
      });
      return {
        status: 'ongoing',
      };
    }

    // delete the elba users that has been sent before this sync
    await step.run('finalize', () =>
      elba.users.delete({ syncedBefore: new Date(syncStartedAt).toISOString() })
    );

    return {
      status: 'completed',
    };
  }
);
