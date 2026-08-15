import mongoose, { Schema, Model } from 'mongoose';

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  role: 'owner' | 'mechanic' | 'admin';
  phone: string;
  createdAt: Date;
}

const UserSchema: Schema<IUser> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['owner', 'mechanic', 'admin'], default: 'owner', required: true },
  phone: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
