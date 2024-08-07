import mongoose from "mongoose";
import { boolean } from "yup";


const Schema = mongoose.Schema;

const RefreshTokenSchema = new Schema(
    {
      token: {
        type: String,
        required: true,
        default: null,
      },
      expired: {
        type: Boolean,
        required: true,
        default: false,
      },
    },
    {
      timestamps: true,
    }
  );
  
  RefreshTokenSchema.methods.toJSON = function () {
    const refreshToken = this.toObject();
    delete refreshToken.token;
    return refreshToken;
  };
  
  const RefreshTokenModel = mongoose.model('RefreshToken', RefreshTokenSchema);
  
  export default RefreshTokenModel;