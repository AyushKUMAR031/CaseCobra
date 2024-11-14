"use server"

import { BASE_PRICE, PRODUCT_PRICES } from "@/config/product"
import { db } from "@/db"
import { stripe } from "@/lib/stripe"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs/types"
import { Order } from "@prisma/client"

export const createCheckoutSession = async ({configId, user}:{configId : string,user: KindeUser<any> | null}) => {
    const configuration = await db.configuration.findUnique({
        where: { id: configId },
    })

    if(!configuration) {
        throw new Error('No such Configuration found')
    }

    // get the user from the session by kindServer and checking if the user is logged in
    // const {getUser} = getKindeServerSession()
    // const user = await getUser()

    if(!user) {
        throw new Error('You need to be logged in')
    }

    const {finish, material} = configuration

    let price = BASE_PRICE
    if(finish === 'textured') {
        price += PRODUCT_PRICES.finish.textured
    }
    if(material === 'polycarbonate') {
        price += PRODUCT_PRICES.material.polycarbonate
    }

    let order: Order | undefined = undefined

    const existingOrder = await db.order.findFirst({
        where: {
        userId: user.id,
        configurationId: configuration.id,
        },
    })

    console.log(user.id, configuration.id)

    if (existingOrder) {
        order = existingOrder
    } else {
        order = await db.order.create({
          data: {
            amount: price / 100,
            userId: user.id,
            configurationId: configuration.id,
          },
        })
    }

    const product = await stripe.products.create({
        name: 'Custom iPhone Case',
        images: [configuration.imageUrl],
        default_price_data: {
          currency: "USD",
          unit_amount: price/80,
        },
      })
    
      const stripeSession = await stripe.checkout.sessions.create({
        success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you?orderId=${order.id}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/configure/preview?id=${configuration.id}`,
        payment_method_types: ["amazon_pay","card"],
        mode: 'payment',
        shipping_address_collection: { allowed_countries: ["IN"] },
        metadata: {
          userId: user.id,
          orderId: order.id,
        },
        line_items: [{ price: product.default_price as string, quantity: 1 }],
      })
    
      return { url: stripeSession.url }
}