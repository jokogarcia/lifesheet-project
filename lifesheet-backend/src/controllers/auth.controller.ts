import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/user.model';
import { ApiError } from '../middleware/errorHandler';




// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user!.id);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
export const updateMe = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user!.id);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (name) user.name = name;
    if (email) user.email = email;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
      },
    });
  } catch (error) {
    next(error);
  }
};
