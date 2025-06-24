import { Request, Response, NextFunction } from 'express';
import CV, { ICV } from '../models/cv.model';
import { ApiError } from '../middleware/errorHandler';
import path from 'path';
import fs from 'fs';

// @desc    Create a new CV
// @route   POST /api/cvs
// @access  Private
export const createCV = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, title, personalInfo, sections, isPublic, customStyles } = req.body;

    const cv = await CV.create({
      user: req.user!.id,
      name,
      title,
      personalInfo,
      sections,
      isPublic,
      customStyles,
    });

    res.status(201).json({
      success: true,
      data: cv,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all CVs for a user
// @route   GET /api/cvs
// @access  Private
export const getCVs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cvs = await CV.find({ user: req.user!.id });

    res.status(200).json({
      success: true,
      count: cvs.length,
      data: cvs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single CV
// @route   GET /api/cvs/:id
// @access  Private
export const getCV = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cv = await CV.findById(req.params.id);

    if (!cv) {
      throw new ApiError(404, 'CV not found');
    }

    // Check if the CV belongs to the user or is public
    if (cv.user.toString() !== req.user!.id && !cv.isPublic) {
      throw new ApiError(401, 'Not authorized to access this CV');
    }

    res.status(200).json({
      success: true,
      data: cv,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update CV
// @route   PUT /api/cvs/:id
// @access  Private
export const updateCV = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let cv = await CV.findById(req.params.id);

    if (!cv) {
      throw new ApiError(404, 'CV not found');
    }

    // Check ownership
    if (cv.user.toString() !== req.user!.id) {
      throw new ApiError(401, 'Not authorized to update this CV');
    }

    // Update fields
    cv = await CV.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: cv,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete CV
// @route   DELETE /api/cvs/:id
// @access  Private
export const deleteCV = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cv = await CV.findById(req.params.id);

    if (!cv) {
      throw new ApiError(404, 'CV not found');
    }

    // Check ownership
    if (cv.user.toString() !== req.user!.id) {
      throw new ApiError(401, 'Not authorized to delete this CV');
    }

    await cv.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Tailor a CV for a job
// @route   POST /api/cvs/:id/tailor
// @access  Private
export const tailorCV = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { jobDescription, tailoredSections } = req.body;

    const cv = await CV.findById(req.params.id);

    if (!cv) {
      throw new ApiError(404, 'CV not found');
    }

    // Check ownership
    if (cv.user.toString() !== req.user!.id) {
      throw new ApiError(401, 'Not authorized to tailor this CV');
    }

    // Update the tailored fields
    cv.tailored = {
      jobDescription,
      tailoredSections: tailoredSections || [],
      tailoredDate: new Date(),
    };

    await cv.save();

    res.status(200).json({
      success: true,
      data: cv,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload CV attachment (PDF, image, etc.)
// @route   POST /api/cvs/:id/upload
// @access  Private
export const uploadCVAttachment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'Please upload a file');
    }

    const cv = await CV.findById(req.params.id);

    if (!cv) {
      // Remove uploaded file
      fs.unlinkSync(req.file.path);
      throw new ApiError(404, 'CV not found');
    }

    // Check ownership
    if (cv.user.toString() !== req.user!.id) {
      // Remove uploaded file
      fs.unlinkSync(req.file.path);
      throw new ApiError(401, 'Not authorized to update this CV');
    }

    // Build the URL to access the file
    const fileUrl = `/uploads/${req.file.filename}`;

    // Update attachment URL in CV document if needed
    // (You might want to add an attachments array to your CV model)

    res.status(200).json({
      success: true,
      fileUrl,
    });
  } catch (error) {
    next(error);
  }
};
