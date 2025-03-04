import  { Router } from 'express'
import * as userControllers from '../controllers/user.controller.js'
import  { body } from 'express-validator';
import * as authMiddleware from '../middleware/auth.middleware.js'


const router = Router();

router.post('/register',
  body('email').isEmail().withMessage('EMail must be a valid email address'),
  body('password').isLength({ min: 3 }).withMessage('Password must be at least 3 characters long'),
  userControllers.createUserController)

  router.post('/login',
    body('email').isEmail().withMessage('Email must be a valid email address'),
    body('password').isLength({ min: 3 }).withMessage('Password must be at least 3 characters long'),
    userControllers.loginController)

  router.get('/profile',authMiddleware.authUser, userControllers.profileController)

  router.get('/logout', authMiddleware.authUser, userControllers.logoutController)
  
  router.get("/all", authMiddleware.authUser, userControllers.getAllUsersController);




export default router;