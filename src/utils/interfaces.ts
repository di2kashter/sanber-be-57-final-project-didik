import { Request } from "express";
import { ObjectId } from "mongoose";

export interface IReqUser extends Request {
  user: {
    roles: string[];
    id: string;
    refreshToken?:string;
  };
}

export interface IPaginationQuery {
  page: number;
  limit: number;
  search?: string;
}

export interface OrderItem{
  name : string;
  productId : ObjectId;
  price : number;
  qty : number;
}

export interface Order{
  grandTotal : number;
  orderItems : OrderItem[];
  createdBy : ObjectId;
  status : 'pending' | 'completed' | 'cancelled';
}