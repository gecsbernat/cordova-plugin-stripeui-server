const PORT = 3000;
const SK = 'sk_test_...';
const PK = 'pk_test_...';
const COMPANY_NAME = 'ACME';
const APPLE_MERCHANT_ID = 'com.example.myapp';
const APPLE_MERCHANT_COUNTRYCODE = 'US';
const cors = require("cors");
const express = require("express");
const app = express();
const stripe = require("stripe")(SK);
app.use(express.static("."));
app.use(express.json());
app.use(cors({ origin: '*' }));
app.post("/payment", async (request, response) => {
    try {
        const body = request.body;
        const amount = body.amount || null;
        const currency = body.currency || null;
        const customerId = body.customerId || null;
        const customerEmail = body.customerEmail || null;
        const customerName = body.customerName || null;
        if (amount !== null && currency !== null) {
            let customer = null;
            if (customerId) {
                customer = { id: customerId };
            } else {
                customer = await stripe.customers.create({
                    email: customerEmail,
                    name: customerName
                });
            }
            const ephemeralKey = await stripe.ephemeralKeys.create(
                { customer: customer.id },
                { apiVersion: '2020-08-27' }
            );
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: currency,
                customer: customer.id
            });
            response.status(200).send({
                publishableKey: PK,
                companyName: COMPANY_NAME,
                paymentIntent: paymentIntent.client_secret,
                customerId: customer.id,
                ephemeralKey: ephemeralKey.secret,
                appleMerchantId: APPLE_MERCHANT_ID,
                appleMerchantCountryCode: APPLE_MERCHANT_COUNTRYCODE
            });
        } else {
            error = 'INVALID_PARAMS';
            response.status(500).send(error);
        }
    } catch (error) {
        error = JSON.stringify(error);
        response.status(500).send(error);
    }
});
app.get('/', (req, res) => {
    res.send('<p> Works fine! </p>');
});
app.listen(PORT, () =>
    console.log(`Node server listening on port ${PORT}!`)
);