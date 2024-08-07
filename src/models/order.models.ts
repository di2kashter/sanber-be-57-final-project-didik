import mongoose from "mongoose";
import { Order as Orderinterface } from '@/utils/interfaces';
import ProductsModel from "./products.model";
import mail from "@/utils/mail";
import UserModel from "./user.model";
import { name } from "ejs";
import { date } from "yup";

interface OrderDocument extends Orderinterface, mongoose.Document { };

const Schema = mongoose.Schema;

const OrderItemSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Products",
            required: true
        },
        price: {
            type: Number,
            required: true,
        },
        qty: {
            type: Number,
            required: true,
        },
    },
    {
        _id: false
    }
);

const OrdersSchema = new Schema(
    {
        grandTotal: {
            type: Number,
            required: true,
        },
        orderItems: {
            type: [OrderItemSchema],
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'cancelled'],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

OrdersSchema.pre<OrderDocument>("save", async function (next) {
    try {
        let grandTotal = 0;

        const productIds = this.orderItems.map(item => item.productId);

        const products = await ProductsModel.find({ _id: { $in: productIds } });

        for (const orderItem of this.orderItems) {
            const product = products.find(prod => prod._id.toString() === orderItem.productId.toString());
            if (product) {

                if (product && orderItem.qty > product.qty) {
                    return next(new Error(`Quantity for ${product.name} exceeds available stock of ${product.qty}`));
                }
                grandTotal += orderItem.qty * product?.price;
            }
        }
        this.grandTotal = grandTotal;
        next();
    } catch (error) {
        const _err = error as Error;
        next(_err);
    }

    next();
});

OrdersSchema.post("save", async function (doc, next) {
    const order = doc;

    const user = await UserModel.findById(order.createdBy).exec();

    const date: Date = new Date();
    const year: number = date.getFullYear();
    try {
        const content = await mail.render("order-success.ejs", {
            customerName: user?.fullName,
            orderItems: order.orderItems,
            grandTotal: order.grandTotal,
            companyName: "Toko Kelontong",
            year: year,
            contactEmail: "imdidiksetiawan@zohomail.com"

        });

        const to = user?.email;
        if (!to) {
            throw new Error('Recipient email address is required.');
        }
        await mail.send({
            to: to,
            subject: "Order Success",
            content,
        });
    } catch (error) {
        console.error('Error rendering email template:', error);
    }

    next();

});

const OrderModel = mongoose.model<OrderDocument>('Order', OrdersSchema);

export default OrderModel;