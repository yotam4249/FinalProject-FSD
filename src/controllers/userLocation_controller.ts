import { Request, Response } from "express";
import UserLocationModel from "../models/UserLocation_model";
import BusinessModel from "../models/businessProfileModel";
import { Types } from "mongoose";

const DEFAULT_FLOOR_HEIGHT_METERS = 3.3;

function haversineDistance(coord1: [number, number], coord2: [number, number]): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const inferUserFloor = async (
  userLocation: {
    coordinates: [number, number];
    altitude?: number;
  }
): Promise<number | undefined> => {
  const { coordinates, altitude } = userLocation;
  if (!altitude) return undefined;

  const nearbyBusinesses = await BusinessModel.find();

  let closestBusiness = null;
  let minDistance = Infinity;

  for (const business of nearbyBusinesses) {
    const dist = haversineDistance(coordinates, business.location.coordinates as [number, number]);
    if (dist < 100 && dist < minDistance) {
      closestBusiness = business;
      minDistance = dist;
    }
  }

  if (!closestBusiness) {
    return Math.round(altitude / DEFAULT_FLOOR_HEIGHT_METERS);
  }

  const buildingAltitude = closestBusiness.location.altitude;
  const buildingBaseFloor = closestBusiness.location.floor ?? 0;

  if (buildingAltitude !== undefined) {
    const relativeHeight = altitude - buildingAltitude;
    const estimatedFloor = buildingBaseFloor + Math.round(relativeHeight / DEFAULT_FLOOR_HEIGHT_METERS);
    return estimatedFloor;
  }

  return Math.round(altitude / DEFAULT_FLOOR_HEIGHT_METERS);
};

export const updateUserLocation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: missing user ID" });
    }

    const { coordinates, altitude } = req.body;
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({ error: "Invalid coordinates" });
    }

    const floor = await inferUserFloor({ coordinates: coordinates as [number, number], altitude });

    const updatedLocation = await UserLocationModel.findOneAndUpdate(
      { user: userId },
      { coordinates, altitude, floor, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    res.status(200).json(updatedLocation);
  } catch (err) {
    console.error("❌ Error updating user location:", err);
    res.status(500).json({ error: "Failed to update location" });
  }
};

export const getUserLocation = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId param" });
    }

    const location = await UserLocationModel.findOne({ user: userId });
    if (!location) return res.status(404).json({ message: "Location not found" });

    res.status(200).json(location);
  } catch (err) {
    console.error("❌ Error fetching user location:", err);
    res.status(500).json({ error: "Failed to fetch location" });
  }
};

export const isUserInBusiness = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;
    const businessId = req.params.businessId;

    if (!userId || !businessId) {
      return res.status(400).json({ error: "Missing user or business ID" });
    }

    const userLocation = await UserLocationModel.findOne({ user: userId });
    const business = await BusinessModel.findById(businessId);

    if (!userLocation || !business) {
      return res.status(404).json({ error: "User or business not found" });
    }

    const distance = haversineDistance(
      userLocation.coordinates as [number, number],
      business.location.coordinates as [number, number]
    );

    const userFloor = await inferUserFloor({
      coordinates: userLocation.coordinates as [number, number],
      altitude: userLocation.altitude,
    });

    const businessFloor = business.location.floor;
    const inSameFloor = businessFloor !== undefined && userFloor === businessFloor;

    const isInside = distance <= 100 && inSameFloor;

    res.status(200).json({ inside: isInside, distance, userFloor, businessFloor });
  } catch (err) {
    console.error("❌ Error in isUserInBusiness:", err);
    res.status(500).json({ error: "Failed to check user location" });
  }
};