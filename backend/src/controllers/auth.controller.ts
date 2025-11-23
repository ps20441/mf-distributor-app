import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { generateToken } from '../utils/jwt';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, arn, mobile, email, password, euin } = req.body;

    // Validate required fields
    if (!name || !arn || !mobile || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if distributor already exists
    const existingDistributor = await prisma.distributor.findFirst({
      where: {
        OR: [
          { arn },
          { mobile }
        ]
      }
    });

    if (existingDistributor) {
      return res.status(409).json({ error: 'ARN or mobile already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create distributor
    const distributor = await prisma.distributor.create({
      data: {
        name,
        arn,
        mobile,
        email,
        euin,
        password: hashedPassword
      },
      select: {
        id: true,
        name: true,
        arn: true,
        mobile: true,
        email: true,
        euin: true,
        createdAt: true
      }
    });

    // Generate token
    const token = generateToken({
      id: distributor.id,
      arn: distributor.arn,
      mobile: distributor.mobile
    });

    res.status(201).json({
      message: 'Registration successful',
      token,
      distributor
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { mobile, password } = req.body;

    // Validate required fields
    if (!mobile || !password) {
      return res.status(400).json({ error: 'Mobile and password are required' });
    }

    // Find distributor
    const distributor = await prisma.distributor.findUnique({
      where: { mobile }
    });

    if (!distributor) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, distributor.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken({
      id: distributor.id,
      arn: distributor.arn,
      mobile: distributor.mobile
    });

    res.json({
      message: 'Login successful',
      token,
      distributor: {
        id: distributor.id,
        name: distributor.name,
        arn: distributor.arn,
        mobile: distributor.mobile,
        email: distributor.email,
        euin: distributor.euin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getProfile = async (req: any, res: Response) => {
  try {
    const distributorId = req.user.id;

    const distributor = await prisma.distributor.findUnique({
      where: { id: distributorId },
      select: {
        id: true,
        name: true,
        arn: true,
        mobile: true,
        email: true,
        euin: true,
        createdAt: true
      }
    });

    if (!distributor) {
      return res.status(404).json({ error: 'Distributor not found' });
    }

    res.json({ distributor });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};
