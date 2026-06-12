import { getStripeSync, getUncachableStripeClient } from './stripeClient';
import { storage } from './storage';

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    // Let stripe-replit-sync handle its processing (signature verification etc.)
    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature);

    // Also parse the event directly to keep our user memberLevel in sync
    try {
      const event = JSON.parse(payload.toString());
      await WebhookHandlers.handleSubscriptionEvent(event);
    } catch (err: any) {
      console.error('[webhook] Failed to handle subscription lifecycle event:', err.message);
    }
  }

  static async handleSubscriptionEvent(event: any): Promise<void> {
    const { type, data } = event;
    const obj = data?.object;
    if (!obj) return;

    // checkout.session.completed — user paid, upgrade their level immediately
    if (type === 'checkout.session.completed') {
      const customerId = String(obj.customer ?? '');
      const subscriptionId = String(obj.subscription ?? '');
      const userId = obj.metadata?.userId ? parseInt(obj.metadata.userId) : null;
      const plan = obj.metadata?.plan as string | undefined;

      if (userId && customerId) {
        const memberLevel =
          plan === 'Platinum' ? 'Platinum' : plan === 'Gold' ? 'Gold' : undefined;
        await storage.updateUser(userId, {
          stripeCustomerId: customerId,
          ...(subscriptionId ? { stripeSubscriptionId: subscriptionId } : {}),
          ...(memberLevel ? { memberLevel } : {}),
        });
        console.log(`[webhook] checkout.session.completed — user ${userId} → ${memberLevel ?? 'unchanged'}`);
      }
      return;
    }

    // customer.subscription.created / updated — re-map level from price amount
    if (
      type === 'customer.subscription.created' ||
      type === 'customer.subscription.updated'
    ) {
      const customerId = String(obj.customer ?? '');
      const subscriptionId = String(obj.id ?? '');
      const status: string = obj.status ?? '';

      if (!customerId) return;

      const allUsers = await storage.getAllUsers();
      const user = allUsers.find((u) => u.stripeCustomerId === customerId);
      if (!user) return;

      let newLevel = 'Free';
      if (status === 'active' || status === 'trialing') {
        const items: any[] = obj.items?.data ?? [];
        for (const item of items) {
          const amount: number = item.price?.unit_amount ?? 0;
          if (amount >= 1900) { newLevel = 'Platinum'; break; }
          else if (amount >= 900) { newLevel = 'Gold'; break; }
        }
      }

      await storage.updateUser(user.id, {
        memberLevel: newLevel,
        stripeSubscriptionId: subscriptionId,
      });
      console.log(`[webhook] ${type} — user ${user.id} → ${newLevel} (status=${status})`);
      return;
    }

    // customer.subscription.deleted — downgrade to Free
    if (type === 'customer.subscription.deleted') {
      const customerId = String(obj.customer ?? '');
      if (!customerId) return;

      const allUsers = await storage.getAllUsers();
      const user = allUsers.find((u) => u.stripeCustomerId === customerId);
      if (!user) return;

      await storage.updateUser(user.id, {
        memberLevel: 'Free',
        stripeSubscriptionId: '',
      });
      console.log(`[webhook] customer.subscription.deleted — user ${user.id} → Free`);
      return;
    }
  }
}
