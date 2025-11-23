import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getClients = async (req: AuthRequest, res: Response) => {
  try {
    const distributorId = req.user?.id;

    const clients = await prisma.client.findMany({
      where: { distributorId },
      orderBy: { name: 'asc' }
    });

    res.json({ clients });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ error: 'Failed to get clients' });
  }
};

export const getClientById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const distributorId = req.user?.id;

    const client = await prisma.client.findFirst({
      where: {
        id,
        distributorId
      },
      include: {
        portfolios: {
          include: {
            scheme: true
          }
        },
        transactions: {
          include: {
            scheme: true
          },
          orderBy: { date: 'desc' },
          take: 10
        }
      }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ client });
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({ error: 'Failed to get client' });
  }
};

export const createClient = async (req: AuthRequest, res: Response) => {
  try {
    const distributorId = req.user?.id!;
    const { pan, name, mobile, email, dateOfBirth, kycStatus } = req.body;

    // Validate required fields
    if (!pan || !name || !mobile) {
      return res.status(400).json({ error: 'PAN, name, and mobile are required' });
    }

    // Check if client with same PAN already exists
    const existingClient = await prisma.client.findUnique({
      where: { pan }
    });

    if (existingClient) {
      return res.status(409).json({ error: 'Client with this PAN already exists' });
    }

    // Create client
    const client = await prisma.client.create({
      data: {
        pan,
        name,
        mobile,
        email,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        kycStatus: kycStatus || 'PENDING',
        importedFrom: 'MANUAL',
        distributorId
      }
    });

    res.status(201).json({
      message: 'Client created successfully',
      client
    });
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
};

export const updateClient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const distributorId = req.user?.id;
    const { name, mobile, email, dateOfBirth, kycStatus } = req.body;

    // Check if client exists and belongs to distributor
    const existingClient = await prisma.client.findFirst({
      where: { id, distributorId }
    });

    if (!existingClient) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Update client
    const client = await prisma.client.update({
      where: { id },
      data: {
        name,
        mobile,
        email,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        kycStatus
      }
    });

    res.json({
      message: 'Client updated successfully',
      client
    });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
};

export const deleteClient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const distributorId = req.user?.id;

    // Check if client exists and belongs to distributor
    const existingClient = await prisma.client.findFirst({
      where: { id, distributorId }
    });

    if (!existingClient) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Delete client (will cascade delete portfolios and transactions)
    await prisma.client.delete({
      where: { id }
    });

    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
};
