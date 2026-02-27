// controllers/profile.controller.js
//
// Controlador para manejar las operaciones relacionadas con los perfiles de usuario.
// Permite crear, listar, eliminar perfiles y obtener el perfil predeterminado.
// Este controlador utiliza el servicio de perfiles para interactuar con la base de datos 
// y el middleware de autenticación para asegurar que solo los usuarios autenticados puedan 
// acceder a estas rutas.
//
 
import { asyncHandler } from '../utils/asyncHandler.js';
import * as profileService from '../services/profile.service.js';
import db from '../db/database.js';

export const create = asyncHandler(async (req, res) => {

  const { name, avatar, isChild } = req.body;

  if (!name) {
    const error = new Error("Nombre es requerido");
    error.status = 400;
    throw error;
  }

  const profile = profileService.createProfile({
    userId: req.user.id,
    name,
    avatar,
    isChild
  });

  res.status(201).json({
    success: true,
    profile
  });
});

export const list = asyncHandler(async (req, res) => {

  const profiles = profileService.getProfilesByUser(req.user.id);

  res.json({
    success: true,
    profiles
  });
});

export const remove = asyncHandler(async (req, res) => {

  profileService.deleteProfile(req.params.id, req.user.id);

  res.json({
    success: true,
    message: "Perfil eliminado"
  });
});

export const getDefaultProfile = asyncHandler(async (req, res) => {

  const profile = db.prepare(`
    SELECT id, name, avatar, isChild
    FROM profiles
    WHERE userId = ? AND isDefault = 1
  `).get(req.user.id);

  res.json({
    success: true,
    profile
  });
});


