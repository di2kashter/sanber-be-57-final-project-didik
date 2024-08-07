import { Request, Response } from "express";
import OrderModel from "@/models/order.models";
import * as Yup from 'yup';
import { Order, IReqUser } from "@/utils/interfaces";
import ProductsModel from "@/models/products.model";
import { IPaginationQuery as IPaginationInterface } from "@/utils/interfaces";
import mongoose from "mongoose";
import { ObjectId } from 'mongodb';


const orderValidationSchema = Yup.object().shape({
    orderItems: Yup.array()
        .of(
            Yup.object().shape({
                productId: Yup.string().required(),
                qty: Yup.number().required().min(1).max(5),
            })
        )
        .required(),
    status: Yup.string().oneOf(['pending', 'completed', 'cancelled'], 'status must me one of pending, completed, canceleed').required(),
});


export default {

    async createOrder(req: Request, res: Response) {
        const userId = (req as IReqUser).user.id;
        try {
            await orderValidationSchema.validate(req.body);

            const { orderItems, status }: Order = req.body;
            const products = await ProductsModel.find({ _id: { $in: orderItems.map(item => item.productId) } });

            let grandTotal = 0;

            const updateOrderItems = orderItems.map(orderItem => {
                const product = products.find(prod => prod._id.toString() === orderItem.productId.toString());
                if (!product) {
                    throw new Error(`Product With ID ${orderItem.productId} not found`)
                }
                const totalItemPrice = product.price * orderItem.qty;
                grandTotal += totalItemPrice;

                console.log(grandTotal);
                return {
                    name: product.name,
                    productId: product._id,
                    price: product.price,
                    qty: orderItem.qty,
                };

            });
            const newOrder = new OrderModel({
                grandTotal,
                orderItems: updateOrderItems,
                createdBy: userId,
                status,
            });
            
            await newOrder.save();
            console.log(grandTotal);
            for (const orderItem of newOrder.orderItems) {
                await ProductsModel.findByIdAndUpdate(orderItem.productId, {
                    $inc: { qty: -orderItem.qty },
                });
            }

            res.status(201).json(newOrder);
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                return res.status(400).send({
                    message: "Validation failed",
                    error: error.errors,
                });
            }
            const _err = error as Error;

            res.status(500).json({
                message: "Error New Order",
                data: _err.message,
            });
        }
    },
    async findAll(req: Request, res: Response) {
        const userId = (req as IReqUser).user.id;
        try {
            const {
                limit = 10,
                page = 1,
                search = "",
            } = req.query as unknown as IPaginationInterface;

            const query = { createdBy: userId };

            if (search) {
                Object.assign(query, {
                    name: { $regex: search, $options: "i" },
                });
            }

            const result = await OrderModel.find(query)
                .limit(limit)
                .skip((page - 1) * limit)
                .sort({ createdAt: -1 });

            const total = await OrderModel.countDocuments(query);

            res.status(200).json({
                data: result,
                message: "Success get all Orders",
                page: +page,
                limit: +limit,
                total,
                totalPages: Math.ceil(total / limit),
            });

        } catch (error) {
            const err = error as Error;
            res.status(500).json({
                data: err.message,
                message: "Failed get all Orders",
            });
        }
    },
    async findOne(req: Request, res: Response) {
        const userId = (req as IReqUser).user.id;
        try {
            if (!userId) {
                return res.status(401).send('Unauthorized');
            }
            const result = await OrderModel.findOne({
                _id: req.params.id,
                createdBy: userId,
            }).exec();

            if (!result) {
                return res.status(404).send('Order not found');
            }

            res.status(200).json({
                data: result,
                message: "Success get one product",
            });
        } catch (error) {
            const err = error as Error;
            res.status(500).json({
                data: err.message,
                message: "Failed get one product",
            });
        }
    },
    async update(req: Request, res: Response) {
        const userId = (req as IReqUser).user.id;
        const session = await mongoose.startSession();
        session.startTransaction();
        try {

            if (!userId) {
                return res.status(401).send('Unauthorized');
            }

            const orderId = req.params.id;
            const { orderItems: updatedOrderItems } = req.body;

            const existingOrder = await OrderModel.findOne({ _id: orderId, createdBy: userId });

            if (!existingOrder) {
                return res.status(404).send('Order Not Found');
            }

            const existingOrderItemMap = new Map(
                existingOrder.orderItems.map(item => {
                    const productIdString = item.productId.toString();
                    return [productIdString, item.qty];
                })
            );

            let grandTotal = 0;

            for (const updatedItem of updatedOrderItems) {
                const product = await ProductsModel.findById(updatedItem.productId).session(session);
                if (!product) {
                    throw new Error(`Product with ID ${updatedItem.productId} Not Found`);
                }

                const updatedProductId: string = updatedItem.productId.toString();
                const oldQty = existingOrderItemMap.get(updatedProductId) || 0;
                const qtyDifference = updatedItem.qty - oldQty;

                if (qtyDifference < 0) {
                    product.qty += Math.abs(qtyDifference);
                } else if (qtyDifference > 0) {
                    product.qty -= qtyDifference;
                }

                if (product.qty < 0) {
                    throw new Error(`Not Enough Stok for product ${product.name}`)
                }

                grandTotal += updatedItem.qty * product.price
                console.log(product.price);
                await product.save({ session });

            }
            const result = await OrderModel.findOneAndUpdate(
                { _id: req.params.id, createdBy: userId },
                { orderItems: updatedOrderItems, grandTotal, },
                {
                    new: true, session
                }
            );
            
            await session.commitTransaction();
            session.endSession();

            res.status(200).json({
                data: result,
                message: "Success update product",
            });
        } catch (error) {

            await session.abortTransaction();
            session.endSession();
            const err = error as Error;
            res.status(500).json({
                data: err.message,
                message: "Failed update product",
            });
        }
    },
    async delete(req: Request, res: Response) {
        res.send('Oke delete')
    },
};


