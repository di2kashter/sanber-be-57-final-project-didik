import { Request, Response } from "express";
import * as Yup from "yup";

import jwt from "jsonwebtoken";

import UserModel from "@/models/user.model";
import RefreshTokenModel from "@/models/refreshtoken.models";
import { decrypt } from "@/utils/encryption";
import { SECRET } from "@/utils/env";
import { IReqUser } from "@/utils/interfaces";
import { JWT_SECRET, JWT_REFRESH_TOKEN, JWT_EXPIRES_IN, JWT_EXPIRES_TOKEN } from "@/config";


const validateRegisterSchema = Yup.object().shape({
  fullName: Yup.string().required(),
  username: Yup.string().required(),
  email: Yup.string().email().required(),
  password: Yup.string().required(),
  passwordConfirmation: Yup.string().oneOf(
    [Yup.ref("password"), ""],
    "Passwords must match"
  ),
});

const validateLoginSchema = Yup.object().shape({
  email: Yup.string().email().required(),
  password: Yup.string().required(),
});

const validateProfileSchema = Yup.object().shape({
  fullName: Yup.string().required(),
  password: Yup.string().required(),
  passwordConfirmation: Yup.string().oneOf(
    [Yup.ref("password"), ""],
    "Passwords must match"
  ),
  profilePicture: Yup.string(),
});

const saveRefreshToken = async (refreshToken: string, expired: false) => {
  try {
    const newRefreshToken = new RefreshTokenModel({
      token: refreshToken,
      expired: false,
    });
    await newRefreshToken.save();
    console.log('Refresh token saved successfully');
  } catch (error) {
    console.error('Error saving refresh token:', error);
  }
};

export default {
  async profile(req: Request, res: Response) {
    const userId = (req as IReqUser).user.id;
    try {
      await validateProfileSchema.validate(req.body);

      await UserModel.updateOne({ _id: userId }, { ...req.body });

      const updateProfile = await UserModel.findById(userId);

      res.status(200).json({
        message: "profile update successfully",
        data: updateProfile,
      })
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        return res.status(400).send({
          message: "validation failed",
          error: error.errors,
        });
      }

      const _err = error as Error;

      res.status(500).json({
        message: "error updating profile",
        data: _err.message,
      });

    }
  },

  async me(req: Request, res: Response) {
    const userId = (req as IReqUser).user.id;
    console.log(userId);
    try {
      const user = await UserModel.findById(userId);
      res.status(200).json({
        message: "User details",
        data: user,
      });

    } catch (error) {
      const _err = error as Error;

      res.status(500).json({
        message: "Error getting user details",
        data: _err.message,
      });
    }
  },
  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    try {
      await validateLoginSchema.validate({
        email,
        password,
      });
      const userByEmail = await UserModel.findOne({ email });

      if (!userByEmail) {
        throw new Error("User not found");
      }

      const decryptPassword = decrypt(SECRET, userByEmail.password);

      if (password !== decryptPassword) {
        throw new Error("Email and Password do not match");
      }

      const token = jwt.sign(
        { id: userByEmail._id, roles: userByEmail.roles },
        JWT_SECRET,
        {
          expiresIn: JWT_EXPIRES_IN,
        }
      );

      const refreshToken = jwt.sign(
        { id: userByEmail._id, roles: userByEmail.roles },
        JWT_REFRESH_TOKEN,
        {
          expiresIn: JWT_EXPIRES_TOKEN,
        }
      );

      await saveRefreshToken(refreshToken, false);

      res.json({
        message: "User logged in successfully",
        token: token,
        refreshToken: refreshToken,
      });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        return res.status(400).send({
          message: "Validation failed",
          error: error.errors,
        });
      }

      const _err = error as Error;

      res.status(500).json({
        message: "Error logging in user",
        data: _err.message,
      });
    }
  },
  async register(req: Request, res: Response) {
    const { fullName, username, email, password, roles = ["user"] } = req.body;
    try {
      await validateRegisterSchema.validate({
        fullName,
        username,
        email,
        password,
      });

      const user = await UserModel.create({
        fullName,
        username,
        email,
        password,
        roles,
      });
      res.json({
        message: "User registered successfully",
        data: user,
      });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        return res.status(400).send({
          message: "Validation failed",
          error: error.errors,
        });
      }

      const _err = error as Error;

      res.status(500).json({
        message: "Error registering user",
        data: _err.message,
      });
    }
  },

  async refreshToken(req: Request, res: Response) {
    const userId = (req as IReqUser).user.id;
    try {
      const user = await UserModel.findById(userId);

      if (!user){
        return res.status(404).json({
          message : "user Not found",
        });
      }

      const newToken = jwt.sign(
        { id: user._id, roles: user.roles },
        JWT_SECRET,
        {
          expiresIn: JWT_EXPIRES_IN,
        }
      );

      res.json({
        message: "new token created successfully",
        token: newToken,
      });
    } catch (error) {
      const _err = error as Error;
      res.status(500).json({
        message: "Error create new token",
        data: _err.message,
      });
    }

  },

};
