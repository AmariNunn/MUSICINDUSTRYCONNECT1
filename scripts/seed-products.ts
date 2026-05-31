import { getUncachableStripeClient } from '../server/stripeClient';

async function createProducts() {
  try {
    const stripe = await getUncachableStripeClient();
    console.log('Creating MIC subscription products in Stripe...');

    // --- Gold Plan ($9/mo) ---
    const existingGold = await stripe.products.search({
      query: "name:'MIC Gold' AND active:'true'",
    });

    let goldProductId: string;
    if (existingGold.data.length > 0) {
      goldProductId = existingGold.data[0].id;
      console.log(`Gold product already exists: ${goldProductId}`);
    } else {
      const goldProduct = await stripe.products.create({
        name: 'MIC Gold',
        description: 'Gold membership — enhanced directory visibility, connection requests, and community features',
        metadata: { memberLevel: 'Gold' },
      });
      goldProductId = goldProduct.id;
      console.log(`Created Gold product: ${goldProductId}`);

      const goldPrice = await stripe.prices.create({
        product: goldProductId,
        unit_amount: 900,
        currency: 'usd',
        recurring: { interval: 'month' },
      });
      console.log(`Created Gold monthly price: $9.00/mo (${goldPrice.id})`);
    }

    // --- Platinum Plan ($19/mo) ---
    const existingPlatinum = await stripe.products.search({
      query: "name:'MIC Platinum' AND active:'true'",
    });

    let platinumProductId: string;
    if (existingPlatinum.data.length > 0) {
      platinumProductId = existingPlatinum.data[0].id;
      console.log(`Platinum product already exists: ${platinumProductId}`);
    } else {
      const platinumProduct = await stripe.products.create({
        name: 'MIC Platinum',
        description: 'Platinum membership — all Gold features plus Core community posting, priority listing, and exclusive opportunities',
        metadata: { memberLevel: 'Platinum' },
      });
      platinumProductId = platinumProduct.id;
      console.log(`Created Platinum product: ${platinumProductId}`);

      const platinumPrice = await stripe.prices.create({
        product: platinumProductId,
        unit_amount: 1900,
        currency: 'usd',
        recurring: { interval: 'month' },
      });
      console.log(`Created Platinum monthly price: $19.00/mo (${platinumPrice.id})`);
    }

    console.log('\n✓ Products ready. Webhooks will sync to database automatically.');
  } catch (error: any) {
    console.error('Error creating products:', error.message);
    process.exit(1);
  }
}

createProducts();
